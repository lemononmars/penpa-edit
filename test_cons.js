function check(v1, v2, v3) {
    if (!v1 || !v2 || !v3) return true;
    var min = Math.min(v1, v2, v3);
    var max = Math.max(v1, v2, v3);
    if (max - min === 2 && v1 !== v2 && v1 !== v3 && v2 !== v3) {
        return false;
    }
    return true;
}

console.log(check(3,4,5)); // false
console.log(check(5,4,3)); // false
console.log(check(4,3,5)); // false
console.log(check(1,2,9)); // true
console.log(check(1,1,3)); // true
console.log(check(4,5,7)); // true
