import * as algokit from '@algorandfoundation/algokit-utils';

async function main() {
    const algorand = algokit.AlgorandClient.defaultLocalNet();

    // Crear dos cuentas, receiver and sender
    const alice = algorand.account.random();
    const bob = algorand.account.random();

    console.log("Direccion de Alice: ", alice.addr);
    console.log("Direccion de Bob: ", bob.addr);
    console.log("Informacion completa de Alice: ", await algorand.account.getInformation(alice.addr));
    const dispenser = await algorand.account.dispenser();
    await algorand.send.payment({
        sender: dispenser.addr,
        receiver: alice.addr,
        amount: algokit.algos(10),
    })
    console.log("Informacion completa de Alice: ", await algorand.account.getInformation(alice.addr));
    const result = await algorand.send.assetCreate({
        sender: alice.addr,
        total: 10n, // la N es para hacer numericos respecto a los BigInt en el paquete de algorand
    })
    console.log("ID del asset creado: ", BigInt(result.confirmation.assetIndex!));
    const assetId = BigInt(result.confirmation.assetIndex!);

    console.log("====================================");
    await algorand.send.payment({
        sender: dispenser.addr,
        receiver: bob.addr,
        amount: algokit.algos(10),
    })

    await algorand.send.assetOptIn({
        sender: bob.addr,
        assetId,
    })

    await algorand.send.assetTransfer({
        sender: alice.addr,
        receiver: bob.addr,
        assetId,
        amount: 1n,
    })
    console.log("Informacion completa de Alice: ", await algorand.account.getInformation(alice.addr));
    console.log("Informacion completa de Bob: ", await algorand.account.getInformation(bob.addr));
    await algorand.newGroup().addPayment({
        sender: alice.addr,
        receiver: bob.addr,
        amount: algokit.algos(1),
    }).addAssetTransfer({
        sender: bob.addr,
        receiver: alice.addr,
        assetId,
        amount: 1n,
    }).execute()
    console.log("Informacion completa de Alice: ", await algorand.account.getInformation(alice.addr));
    console.log("Informacion completa de Bob: ", await algorand.account.getInformation(bob.addr));
    console.log("Bob's Min Balance", (await algorand.account.getInformation(bob.addr)).minBalance);

    await algorand.send.assetTransfer({
        sender: bob.addr,
        receiver: alice.addr,
        assetId,
        amount: 0n,
        closeAssetTo: alice.addr,
    })
    console.log("===============================")
    console.log("Bob's Min Balance", (await algorand.account.getInformation(bob.addr)).minBalance);

    await algorand.send.assetTransfer({
        sender: alice.addr,
        receiver: bob.addr,
        assetId,
        amount: 1n,
    })
}

main();