import { near, assert } from "near-sdk-js";
export function bytes_for_approved_account_id(account_id) {
    // The extra 4 bytes are coming from Borsh serialization to store the length of the string.
    return account_id.length + 4 + 8;
}
export function refund_approved_account_ids_iter(account_id, approved_account_ids) {
    const storage_released = approved_account_ids
        .map(bytes_for_approved_account_id)
        .reduce((a, b) => a + b);
    const promise_id = near.promiseBatchCreate(account_id);
    near.promiseBatchActionTransfer(promise_id, BigInt(storage_released) * near.storageByteCost());
    near.promiseReturn(promise_id);
}
export function refund_approved_account_ids(account_id, approved_account_ids) {
    refund_approved_account_ids_iter(account_id, Array.from(Object.keys(approved_account_ids)));
}
export function refund_deposit_to_account(storage_used, account_id) {
    const required_cost = near.storageByteCost() * storage_used;
    const attached_deposit = near.attachedDeposit();
    assert(required_cost <= attached_deposit, `Must attach ${required_cost} yoctoNEAR to cover storage`);
    const refund = attached_deposit - required_cost;
    if (refund > 1n) {
        const promise_id = near.promiseBatchCreate(account_id);
        near.promiseBatchActionTransfer(promise_id, refund);
        near.promiseReturn(promise_id);
    }
}
/** Assumes that the precedecessor will be refunded */
export function refund_deposit(storage_used) {
    refund_deposit_to_account(storage_used, near.predecessorAccountId());
}
export function hash_account_id(account_id) {
    return near.sha256(account_id);
}
/** Assert that at least 1 yoctoNEAR was attached. */
export function assert_at_least_one_yocto() {
    assert(near.attachedDeposit() >= 1n, "Requires attached deposit of at least 1 yoctoNEAR");
}
/** Assert that exactly 1 yoctoNEAR was attached */
export function assert_one_yocto() {
    assert(near.attachedDeposit() === 1n, "Requires attached deposit of 1 yoctoNEAR");
}
