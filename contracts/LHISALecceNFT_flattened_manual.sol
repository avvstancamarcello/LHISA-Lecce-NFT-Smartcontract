//SPDX-License-Identifier: MIT
pragma solidity ^0.8.26; // Impostato alla recente versione 0.8.26 come da hardhat.config.cjs

// Contenuto di node_modules/@openzeppelin/contracts/utils/Context.sol
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}


// Contenuto di node_modules/@openzeppelin/contracts/utils/introspection/IERC165.sol
interface IERC165 {
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}


// Contenuto di node_modules/@openzeppelin/contracts/utils/introspection/ERC165.sol
abstract contract ERC165 is IERC165 {
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IERC165).interfaceId;
    }
}


// Contenuto di node_modules/@openzeppelin/contracts/access/Ownable.sol
abstract contract Ownable is Context {
    address private _owner;

    error OwnableUnauthorizedAccount(address account);
    error OwnableInvalidOwner(address owner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(initialOwner);
    }

    modifier onlyOwner() {
        _checkOwner();
        _; // Placeholder per il codice della funzione
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }

    function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) {
            revert OwnableUnauthorizedAccount(_msgSender());
        }
    }

    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}


// Contenuto di node_modules/@openzeppelin/contracts/utils/math/Math.sol
library Math {
    enum Rounding {
        Floor, // Toward negative infinity
        Ceil, // Toward positive infinity
        Trunc, // Toward zero
        Expand // Away from zero
    }

    function add512(uint256 a, uint256 b) internal pure returns (uint256 high, uint256 low) {
        assembly ("memory-safe") {
            low := add(a, b)
            high := lt(low, a)
        }
    }

    function mul512(uint256 a, uint256 b) internal pure returns (uint256 high, uint256 low) {
        assembly ("memory-safe") {
            let mm := mulmod(a, b, not(0))
            low := mul(a, b)
            high := sub(sub(mm, low), lt(mm, low))
        }
    }

    function tryAdd(uint256 a, uint256 b) internal pure returns (bool success, uint256 result) {
        unchecked {
            uint256 c = a + b;
            success = c >= a;
            result = c;
            if (!success) {
                 result = 0; // Or Panic.panic(Panic.UNDER_OVERFLOW);
            }
        }
    }

    function trySub(uint256 a, uint256 b) internal pure returns (bool success, uint256 result) {
        unchecked {
            uint256 c = a - b;
            success = c <= a;
            result = c;
            if (!success) {
                result = 0; // Or Panic.panic(Panic.UNDER_OVERFLOW);
            }
        }
    }

    function tryMul(uint256 a, uint256 b) internal pure returns (bool success, uint256 result) {
        unchecked {
            uint256 c = a * b;
            assembly ("memory-safe") {
                success := or(eq(div(c, a), b), iszero(a))
            }
            result = c;
            if (!success) {
                result = 0; // Or Panic.panic(Panic.UNDER_OVERFLOW);
            }
        }
    }

    function tryDiv(uint256 a, uint256 b) internal pure returns (bool success, uint256 result) {
        unchecked {
            success = b > 0;
            assembly ("memory-safe") {
                result := div(a, b)
            }
        }
    }

    function tryMod(uint256 a, uint256 b) internal pure returns (bool success, uint256 result) {
        unchecked {
            success = b > 0;
            assembly ("memory-safe") {
                result := mod(a, b)
            }
        }
    }

    function saturatingAdd(uint256 a, uint256 b) internal pure returns (uint256) {
        (bool success, uint256 result) = tryAdd(a, b);
        return success ? result : type(uint256).max;
    }

    function saturatingSub(uint256 a, uint256 b) internal pure returns (uint256) {
        (, uint256 result) = trySub(a, b);
        return result;
    }

    function saturatingMul(uint256 a, uint256 b) internal pure returns (uint256) {
        (bool success, uint256 result) = tryMul(a, b);
        return success ? result : type(uint256).max;
    }

    function ternary(bool condition, uint256 a, uint256 b) internal pure returns (uint256) {
        unchecked {
            return condition ? a : b;
        }
    }

    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return ternary(a > b, a, b);
    }

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return ternary(a < b, a, b);
    }

    function average(uint256 a, uint256 b) internal pure returns (uint256) {
        return (a & b) + ((a ^ b) / 2);
    }

    function ceilDiv(uint256 a, uint256 b) internal pure returns (uint256) {
        if (b == 0) {
        Panic.panic(Panic.DIVISION_BY_ZERO);
        }
        unchecked {
            return (a + b - 1) / b;
        }
    }

    function mulDiv(uint256 x, uint256 y, uint256 denominator) internal pure returns (uint256 result) {
        unchecked {
            (uint256 high, uint256 low) = mul512(x, y);
            if (high == 0) {
                return low / denominator;
            }
            if (denominator == 0) {
                Panic.panic(Panic.DIVISION_BY_ZERO);
            }
            if (denominator <= high) {
                 Panic.panic(Panic.UNDER_OVERFLOW);
            }

            uint256 remainder;
            assembly ("memory-safe") {
                remainder := mulmod(x, y, denominator)
                high := sub(high, lt(remainder, low))
                low := sub(low, remainder)
            }

            uint256 twos = denominator & (0 - denominator);
            assembly ("memory-safe") {
                denominator := div(denominator, twos)
                low := div(low, twos)
                twos := add(div(sub(0, twos), twos), 1)
            }
            low |= high * twos;

            uint256 inverse = (3 * denominator) ^ 2;
            inverse *= 2 - denominator * inverse;
            inverse *= 2 - denominator * inverse;
            inverse *= 2 - denominator * inverse;
            inverse *= 2 - denominator * inverse;
            inverse *= 2 - denominator * inverse;
            inverse *= 2 - denominator * inverse;
            result = low * inverse;
            return result;
        }
    }

    function mulDiv(uint256 x, uint256 y, uint256 denominator, Rounding rounding) internal pure returns (uint256) {
        return mulDiv(x, y, denominator) + (unsignedRoundsUp(rounding) && mulmod(x, y, denominator) > 0 ? 1 : 0);
    }

    function mulShr(uint256 x, uint256 y, uint8 n) internal pure returns (uint256 result) {
        unchecked {
            (uint256 high, uint256 low) = mul512(x, y);
            if (high >= (1 << n)) {
                Panic.panic(Panic.UNDER_OVERFLOW);
            }
            return (high << (256 - n)) | (low >> n);
        }
    }

    function mulShr(uint256 x, uint256 y, uint8 n, Rounding rounding) internal pure returns (uint256) {
        return mulShr(x, y, n) + (unsignedRoundsUp(rounding) && mulmod(x, y, (1 << n)) > 0 ? 1 : 0);
    }

    function invMod(uint256 a, uint256 n) internal pure returns (uint256) {
        unchecked {
            if (n == 0) return 0;
            uint256 remainder = a % n;
            uint256 gcd = n;
            int256 x = 0;
            int256 y = 1;
            while (remainder != 0) {
                uint256 quotient = gcd / remainder;
                (gcd, remainder) = (remainder, gcd % remainder);

                (x, y) = (y, x - y * int256(quotient));
            }
            if (gcd != 1) return 0;
            return x < 0 ? n - uint256(-x) : uint256(x);
        }
    }

    function invModPrime(uint256 a, uint256 p) internal view returns (uint256) {
        unchecked {
            return Math.modExp(a, p - 2, p);
        }
    }

    function modExp(uint256 b, uint256 e, uint256 m) internal view returns (uint256) {
        (bool success, uint256 result) = tryModExp(b, e, m);
        if (!success) {
            Panic.panic(Panic.DIVISION_BY_ZERO);
        }
        return result;
    }

    function tryModExp(uint256 b, uint256 e, uint256 m) internal view returns (bool success, uint256 result) {
        if (m == 0) return (false, 0);
        assembly ("memory-safe") {
            let ptr := mload(0x40)
            mstore(ptr, 0x20)
            mstore(add(ptr, 0x20), 0x20)
            mstore(add(ptr, 0x40), 0x20)
            mstore(add(ptr, 0x60), b)
            mstore(add(ptr, 0x80), e)
            mstore(add(ptr, 0xa0), m)

            success := staticcall(gas(), 0x05, ptr, 0xc0, 0x00, 0x20)
            result := mload(0x00)
        }
    }

    function modExp(bytes memory b, bytes memory e, bytes memory m) internal view returns (bytes memory) {
        (bool success, bytes memory result) = tryModExp(b, e, m);
        if (!success) {
            Panic.panic(Panic.DIVISION_BY_ZERO);
        }
        return result;
    }

    function tryModExp(bytes memory b, bytes memory e, bytes memory m) internal view returns (bool success, bytes memory result) {
        if (_zeroBytes(m)) return (false, new bytes(0));
        uint256 mLen = m.length;
        result = abi.encodePacked(b.length, e.length, mLen, b, e, m);
        assembly ("memory-safe") {
            let dataPtr := add(result, 0x20)
            success := staticcall(gas(), 0x05, dataPtr, mload(result), dataPtr, mLen)
            mstore(result, mLen)
            mstore(0x40, add(dataPtr, mLen))
        }
    }

    function _zeroBytes(bytes memory byteArray) private pure returns (bool) {
        for (uint256 i = 0; i < byteArray.length; ++i) {
            if (byteArray[i] != 0) {
                return false;
            }
        }
        return true;
    }

    function sqrt(uint256 a) internal pure returns (uint256) {
        unchecked {
            if (a <= 1) {
                return a;
            }
            uint256 xn = 1;
            if (a >= (1 << 128)) {
                a >>= 128;
                xn <<= 64;
            }
            if (a >= (1 << 64)) {
                a >>= 64;
                xn <<= 32;
            }
            if (a >= (1 << 32)) {
                a >>= 32;
                xn <<= 16;
            }
            if (a >= (1 << 16)) {
                a >>= 16;
                xn <<= 8;
            }
            if (a >= (1 << 8)) {
                a >>= 8;
                xn <<= 4;
            }
            if (a >= (1 << 4)) {
                a >>= 4;
                xn <<= 2;
            }
            if (a >= (1 << 2)) {
                xn <<= 1;
            }
            xn = (3 * xn) >> 1;
            for (uint256 i = 0; i < 6; i++) {
                xn = (xn + a / xn) >> 1;
            }
            return xn + (xn * xn > a ? 0 : 1);
        }
    }

    function sqrt(uint256 a, Rounding rounding) internal pure returns (uint256) {
        unchecked {
            uint256 result = sqrt(a);
            return result + (unsignedRoundsUp(rounding) && result * result < a ? 1 : 0);
        }
    }

    function log2(uint256 x) internal pure returns (uint256 r) {
        if (x == 0) return 0;
        r = (x > 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF) ? 128 : 0;
        if (x >= (1 << (r + 64))) r += 64;
        if (x >= (1 << (r + 32))) r += 32;
        if (x >= (1 << (r + 16))) r += 16;
        if (x >= (1 << (r + 8))) r += 8;
        if (x >= (1 << (r + 4))) r += 4;
        if (x >= (1 << (r + 2))) r += 2;
        if (x >= (1 << (r + 1))) r += 1;
        return r;
    }

    function log2(uint256 value, Rounding rounding) internal pure returns (uint256) {
        unchecked {
            uint256 result = log2(value);
            return result + (unsignedRoundsUp(rounding) && (1 << result) < value ? 1 : 0);
        }
    }

    function log10(uint256 value) internal pure returns (uint256) {
        if (value == 0) return 0;
        uint256 result = 0;
        unchecked {
            if (value >= 10**64) { value /= 10**64; result += 64; }
            if (value >= 10**32) { value /= 10**32; result += 32; }
            if (value >= 10**16) { value /= 10**16; result += 16; }
            if (value >= 10**8) { value /= 10**8; result += 8; }
            if (value >= 10**4) { value /= 10**4; result += 4; }
            if (value >= 10**2) { value /= 10**2; result += 2; }
            if (value >= 10**1) { result += 1; }
        }
        return result;
    }

    function log10(uint256 value, Rounding rounding) internal pure returns (uint256) {
        unchecked {
            uint256 result = log10(value);
            return result + (unsignedRoundsUp(rounding) && (10 ** result) < value ? 1 : 0);
        }
    }

    function log256(uint256 x) internal pure returns (uint256 r) {
        if (x == 0) return 0;
        r = (x > 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF) ? 128 : 0;
        if (x >= (1 << (r + 64))) r += 64;
        if (x >= (1 << (r + 32))) r += 32;
        if (x >= (1 << (r + 16))) r += 16;
        if (x >= (1 << (r + 8))) r += 8;
        if (x >= (1 << (r + 4))) r += 4;
        if (x >= (1 << (r + 2))) r += 2;
        if (x >= (1 << (r + 1))) r += 1;
        return (r >> 3);
    }

    function log256(uint256 value, Rounding rounding) internal pure returns (uint256) {
        unchecked {
            uint256 result = log256(value);
            return result + (unsignedRoundsUp(rounding) && (1 << (result * 8)) < value ? 1 : 0);
        }
    }

    function unsignedRoundsUp(Rounding rounding) internal pure returns (bool) {
        return uint8(rounding) % 2 == 1;
    }
}


// Contenuto di node_modules/@openzeppelin/contracts/utils/SlotDerivation.sol
library SlotDerivation {
    function erc7201Slot(string memory namespace) internal pure returns (bytes32 slot) {
        assembly ("memory-safe") {
            mstore(0x00, sub(keccak256(add(namespace, 0x20), mload(namespace)), 1))
            slot := and(keccak256(0x00, 0x20), not(0xFF))
        }
    }

    function offset(bytes32 slot, uint256 pos) internal pure returns (bytes32 result) {
        unchecked { return bytes32(uint256(slot) + pos); }
    }

    function deriveArray(bytes32 slot) internal pure returns (bytes32 result) {
        assembly ("memory-safe") {
            mstore(0x00, slot)
            result := keccak256(0x00, 0x20)
        }
    }

    function deriveMapping(bytes32 slot, address key) internal pure returns (bytes32 result) {
        assembly ("memory-safe") {
            mstore(0x00, and(key, shr(96, not(0))))
            mstore(0x20, slot)
            result := keccak256(0x00, 0x40)
        }
    }

    function deriveMapping(bytes32 slot, bool key) internal pure returns (bytes32 result) {
        assembly ("memory-safe") {
            mstore(0x00, iszero(iszero(key)))
            mstore(0x20, slot)
            result := keccak256(0x00, 0x40)
        }
    }

    function deriveMapping(bytes32 slot, bytes32 key) internal pure returns (bytes32 result) {
        assembly ("memory-safe") {
            mstore(0x00, key)
            mstore(0x20, slot)
            result := keccak256(0x00, 0x40)
        }
    }

    function deriveMapping(bytes32 slot, uint256 key) internal pure returns (bytes32 result) {
        assembly ("memory-safe") {
            mstore(0x00, key)
            mstore(0x20, slot)
            result := keccak256(0x00, 0x40)
        }
    }

    function deriveMapping(bytes32 slot, int256 key) internal pure returns (bytes32 result) {
        assembly ("memory-safe") {
            mstore(0x00, key)
            mstore(0x20, slot)
            result := keccak256(0x00, 0x40)
        }
    }

    function deriveMapping(bytes32 slot, string memory key) internal pure returns (bytes32 result) {
        assembly ("memory-safe") {
            let length := mload(key)
            let begin := add(key, 0x20)
            let end := add(begin, length)
            let cache := mload(end)
            mstore(end, slot)
            result := keccak256(begin, add(length, 0x20))
            mstore(end, cache)
        }
    }

    function deriveMapping(bytes32 slot, bytes memory key) internal pure returns (bytes32 result) {
        assembly ("memory-safe") {
            let length := mload(key)
            let begin := add(key, 0x20)
            let end := add(begin, length)
            let cache := mload(end)
            mstore(end, slot)
            result := keccak256(begin, add(length, 0x20))
            mstore(end, cache)
        }
    }
}


// Contenuto di node_modules/@openzeppelin/contracts/utils/StorageSlot.sol
library StorageSlot {
    struct AddressSlot { address value; }
    struct BooleanSlot { bool value; }
    struct Bytes32Slot { bytes32 value; }
    struct Uint256Slot { uint256 value; }
    struct Int256Slot { int256 value; }
    struct StringSlot { string value; }
    struct BytesSlot { bytes value; }

    function getAddressSlot(bytes32 slot) internal pure returns (AddressSlot storage r) {
        assembly ("memory-safe") { r.slot := slot }
    }

    function getBooleanSlot(bytes32 slot) internal pure returns (BooleanSlot storage r) {
        assembly ("memory-safe") { r.slot := slot }
    }

    function getBytes32Slot(bytes32 slot) internal pure returns (Bytes32Slot storage r) {
        assembly ("memory-safe") { r.slot := slot }
    }

    function getUint256Slot(bytes32 slot) internal pure returns (Uint256Slot storage r) {
        assembly ("memory-safe") { r.slot := slot }
    }

    function getInt256Slot(bytes32 slot) internal pure returns (Int256Slot storage r) {
        assembly ("memory-safe") { r.slot := slot }
    }

    function getStringSlot(bytes32 slot) internal pure returns (StringSlot storage r) {
        assembly ("memory-safe") { r.slot := slot }
    }

    function getStringSlot(string storage store) internal pure returns (StringSlot storage r) {
        assembly ("memory-safe") { r.slot := store.slot }
    }

    function getBytesSlot(bytes32 slot) internal pure returns (BytesSlot storage r) {
        assembly ("memory-safe") { r.slot := slot }
    }

    function getBytesSlot(bytes storage store) internal pure returns (BytesSlot storage r) {
        assembly ("memory-safe") { r.slot := store.slot }
    }
}


// Contenuto di node_modules/@openzeppelin/contracts/utils/math/SignedMath.sol
library SignedMath {
    function ternary(bool condition, int256 a, int256 b) internal pure returns (int256) {
        unchecked {
            return condition ? a : b;
        }
    }

    function max(int256 a, int256 b) internal pure returns (int256) {
        return ternary(a > b, a, b);
    }

    function min(int256 a, int256 b) internal pure returns (int256) {
        return ternary(a < b, a, b);
    }

    function average(int256 a, int256 b) internal pure returns (int256) {
        unchecked {
            return (a & b) + ((a ^ b) >> 1);
        }
    }

    function abs(int256 n) internal pure returns (uint256) {
        unchecked {
            int256 mask = n >> 255; // Correct shift for 256-bit signed integer
            return uint256((n + mask) ^ mask);
        }
    }
}


// Contenuto di node_modules/@openzeppelin/contracts/utils/Panic.sol
library Panic {
    uint256 internal constant GENERIC = 0x00;
    uint256 internal constant ASSERT = 0x01;
    uint256 internal constant UNDER_OVERFLOW = 0x11;
    uint256 internal constant DIVISION_BY_ZERO = 0x12;
    uint256 internal constant ENUM_CONVERSION_ERROR = 0x21;
    uint256 internal constant STORAGE_ENCODING_ERROR = 0x22;
    uint256 internal constant EMPTY_ARRAY_POP = 0x31;
    uint256 internal constant ARRAY_OUT_OF_BOUNDS = 0x32;
    uint256 internal constant RESOURCE_ERROR = 0x41;
    uint256 internal constant INVALID_INTERNAL_FUNCTION = 0x51;

    function panic(uint256 code) internal pure {
        assembly ("memory-safe") {
            mstore(0x00, 0x4e487b71)
            mstore(0x20, code)
            revert(0x1c, 0x24)
        }
    }
}


// Contenuto di node_modules/@openzeppelin/contracts/utils/Comparators.sol
library Comparators {
    function lt(uint256 a, uint256 b) internal pure returns (bool) {
        return a < b;
    }

    function gt(uint256 a, uint256 b) internal pure returns (bool) {
        return a > b;
    }
}


// Contenuto di node_modules/@openzeppelin/contracts/utils/Arrays.sol
library Arrays {
    using SlotDerivation for bytes32;
    using StorageSlot for bytes32;
    using Comparators for uint256; 

    function sort(uint256[] memory array, function(uint256, uint256) pure returns (bool) comp) internal pure returns (uint256[] memory) {
        _quickSort(_begin(array), _end(array), comp);
        return array;
    }

    function sort(uint256[] memory array) internal pure returns (uint256[] memory) {
        return sort(array, Comparators.lt);
    }

    function sort(address[] memory array, function(address, address) pure returns (bool) comp) internal pure returns (address[] memory) {
        return sort(_castToUint256Array(array), _castToUint256Comp(comp));
    }

    function sort(address[] memory array) internal pure returns (address[] memory) {
        return sort(_castToUint256Array(array), Comparators.lt);
    }

    function sort(bytes32[] memory array, function(bytes32, bytes32) pure returns (bool) comp) internal pure returns (bytes32[] memory) {
        return sort(_castToUint256Array(array), _castToUint256Comp(comp));
    }

    function sort(bytes32[] memory array) internal pure returns (bytes32[] memory) {
        return sort(_castToUint256Array(array), Comparators.lt);
    }

    function _quickSort(uint256 begin, uint256 end, function(uint256, uint256) pure returns (bool) comp) private pure {
        unchecked {
            if (end - begin < 0x40) return;
            uint256 pivot = _mload(begin);
            uint256 pos = begin;
            for (uint256 it = begin + 0x20; it < end; it += 0x20) {
                if (comp(_mload(it), pivot)) {
                    pos += 0x20;
                    _swap(pos, it);
                }
            }
            _swap(begin, pos);
            _quickSort(begin, pos, comp);
            _quickSort(pos + 0x20, end, comp);
        }
    }

    function _begin(uint256[] memory array) private pure returns (uint256 ptr) {
        assembly ("memory-safe") {
            ptr := add(array, 0x20)
        }
    }

    function _end(uint256[] memory array) private pure returns (uint256 ptr) {
        unchecked {
            return _begin(array) + array.length * 0x20;
        }
    }

    function _mload(uint256 ptr) private pure returns (uint256 value) {
        assembly {
            value := mload(ptr)
        }
    }

    function _swap(uint256 ptr1, uint256 ptr2) private pure {
        assembly {
            let value1 := mload(ptr1)
            let value2 := mload(ptr2)
            mstore(ptr1, value2)
            mstore(ptr2, value1)
        }
    }

    function _castToUint256Array(address[] memory input) private pure returns (uint256[] memory output) {
        assembly { output := input }
    }

    function _castToUint256Array(bytes32[] memory input) private pure returns (uint256[] memory output) {
        assembly { output := input }
    }

    function _castToUint256Comp(function(address, address) pure returns (bool) input) private pure returns (function(uint256, uint256) pure returns (bool) output) {
        assembly { output := input }
    }

    function _castToUint256Comp(function(bytes32, bytes32) pure returns (bool) input) private pure returns (function(uint256, uint256) pure returns (bool) output) {
        assembly { output := input }
    }

    function findUpperBound(uint256[] storage array, uint256 element) internal view returns (uint256) {
        uint256 low = 0;
        uint256 high = array.length;
        if (high == 0) {
            return 0;
        }
        while (low < high) {
            uint256 mid = Math.average(low, high);
            if (unsafeAccess(array, mid).value > element) {
                high = mid;
            } else {
                low = mid + 1;
            }
        }
        return (low > 0 && unsafeAccess(array, low - 1).value == element) ? low - 1 : low;
    }

    function lowerBound(uint256[] storage array, uint256 element) internal view returns (uint256) {
        uint256 low = 0;
        uint256 high = array.length;
        if (high == 0) {
            return 0;
        }
        while (low < high) {
            uint256 mid = Math.average(low, high);
            if (unsafeAccess(array, mid).value < element) {
                unchecked { low = mid + 1; }
            } else {
                high = mid;
            }
        }
        return low;
    }

    function upperBound(uint256[] storage array, uint256 element) internal view returns (uint256) {
        uint256 low = 0;
        uint256 high = array.length;
        if (high == 0) {
            return 0;
        }
        while (low < high) {
            uint256 mid = Math.average(low, high);
            if (unsafeAccess(array, mid).value > element) {
                high = mid;
            } else {
                unchecked { low = mid + 1; }
            }
        }
        return low;
    }

    function lowerBoundMemory(uint256[] memory array, uint256 element) internal pure returns (uint256) {
        uint256 low = 0;
        uint256 high = array.length;
        if (high == 0) {
            return 0;
        }
        while (low < high) {
            uint256 mid = Math.average(low, high);
            if (unsafeMemoryAccess(array, mid) < element) {
                unchecked { low = mid + 1; }
            } else {
                high = mid;
            }
        }
        return low;
    }

    function upperBoundMemory(uint256[] memory array, uint256 element) internal pure returns (uint256) {
        uint256 low = 0;
        uint256 high = array.length;
        if (high == 0) {
            return 0;
        }
        while (low < high) {
            uint256 mid = Math.average(low, high);
            if (unsafeMemoryAccess(array, mid) > element) {
                high = mid;
            } else {
                unchecked { low = mid + 1; }
            }
        }
        return low;
    }

    function unsafeAccess(address[] storage arr, uint256 pos) internal pure returns (StorageSlot.AddressSlot storage r) {
        assembly ("memory-safe") { r.slot := arr.slot }
        return r.deriveArray().offset(pos).getAddressSlot();
    }

    function unsafeAccess(bytes32[] storage arr, uint256 pos) internal pure returns (StorageSlot.Bytes32Slot storage r) {
        assembly ("memory-safe") { r.slot := arr.slot }
        return r.deriveArray().offset(pos).getBytes32Slot();
    }

    function unsafeAccess(uint256[] storage arr, uint256 pos) internal pure returns (StorageSlot.Uint256Slot storage r) {
        assembly ("memory-safe") { r.slot := arr.slot }
        return r.deriveArray().offset(pos).getUint256Slot();
    }

    function unsafeMemoryAccess(address[] memory arr, uint256 pos) internal pure returns (address res) {
        assembly { res := mload(add(add(arr, 0x20), mul(pos, 0x20))) }
    }

    function unsafeMemoryAccess(bytes32[] memory arr, uint256 pos) internal pure returns (bytes32 res) {
        assembly { res := mload(add(add(arr, 0x20), mul(pos, 0x20))) }
    }

    function unsafeMemoryAccess(uint256[] memory arr, uint256 pos) internal pure returns (uint256 res) {
        assembly { res := mload(add(add(arr, 0x20), mul(pos, 0x20))) }
    }

    function unsafeSetLength(address[] storage array, uint256 len) internal {
        assembly ("memory-safe") { sstore(array.slot, len) }
    }

    function unsafeSetLength(bytes32[] storage array, uint256 len) internal {
        assembly ("memory-safe") { sstore(array.slot, len) }
    }

    function unsafeSetLength(uint256[] storage array, uint256 len) internal {
        assembly ("memory-safe") { sstore(array.slot, len) }
    }
}


// Contenuto di node_modules/@openzeppelin/contracts/interfaces/draft-IERC6093.sol
interface IERC20Errors {
    error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed);
    error ERC20InvalidSender(address sender);
    error ERC20InvalidReceiver(address receiver);
    error ERC20InsufficientAllowance(address spender, uint256 allowance, uint256 needed);
    error ERC20InvalidApprover(address approver);
    error ERC20InvalidSpender(address spender);
}

interface IERC721Errors {
    error ERC721InvalidOwner(address owner);
    error ERC721NonexistentToken(uint256 tokenId);
    error ERC721IncorrectOwner(address sender, uint256 tokenId, address owner);
    error ERC721InvalidSender(address sender);
    error ERC721InvalidReceiver(address receiver);
    error ERC721InsufficientApproval(address operator, uint256 tokenId);
    error ERC721InvalidApprover(address approver);
    error ERC721InvalidOperator(address operator);
}

interface IERC1155Errors {
    error ERC1155InsufficientBalance(address sender, uint256 balance, uint256 needed, uint256 tokenId);
    error ERC1155InvalidSender(address sender);
    error ERC1155InvalidReceiver(address receiver);
    error ERC1155MissingApprovalForAll(address operator, address owner);
    error ERC1155InvalidApprover(address approver);
    error ERC1155InvalidOperator(address operator);
    error ERC1155InvalidArrayLength(uint256 idsLength, uint256 valuesLength);
}


// Contenuto di node_modules/@openzeppelin/contracts/token/ERC1155/IERC1155.sol
interface IERC1155 is IERC165 {
    event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value);
    event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values);
    event ApprovalForAll(address indexed account, address indexed operator, bool approved);
    event URI(string value, uint256 indexed id);

    function balanceOf(address account, uint256 id) external view returns (uint256);
    function balanceOfBatch(address[] calldata accounts, uint256[] calldata ids) external view returns (uint256[] memory);
    function setApprovalForAll(address operator, bool approved) external;
    function isApprovedForAll(address account, address operator) external view returns (bool);
    function safeTransferFrom(address from, address to, uint256 id, uint256 value, bytes calldata data) external;
    function safeBatchTransferFrom(address from, address to, uint256[] calldata ids, uint256[] calldata values, bytes calldata data) external;
}


// Contenuto di node_modules/@openzeppelin/contracts/token/ERC1155/extensions/IERC1155MetadataURI.sol
interface IERC1155MetadataURI is IERC1155 {
    function uri(uint256 id) external view returns (string memory);
}


// Contenuto di node_modules/@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol
interface IERC1155Receiver is IERC165 {
    function onERC1155Received(address operator, address from, uint256 id, uint256 value, bytes calldata data) external returns (bytes4);
    function onERC1155BatchReceived(address operator, address from, uint256[] calldata ids, uint256[] calldata values, bytes calldata data) external returns (bytes4);
}


// Contenuto di node_modules/@openzeppelin/contracts/token/ERC1155/utils/ERC1155Utils.sol
library ERC1155Utils {
    function checkOnERC1155Received(address operator, address from, address to, uint256 id, uint256 value, bytes memory data) internal {
        if (to.code.length > 0) {
            try IERC1155Receiver(to).onERC1155Received(operator, from, id, value, data) returns (bytes4 response) {
                if (response != IERC1155Receiver.onERC1155Received.selector) {
                    revert IERC1155Errors.ERC1155InvalidReceiver(to);
                }
            } catch (bytes memory reason) {
                if (reason.length == 0) {
                    revert IERC1155Errors.ERC1155InvalidReceiver(to);
                } else {
                    assembly ("memory-safe") { revert(add(32, reason), mload(reason)) }
                }
            }
        }
    }

    function checkOnERC1155BatchReceived(address operator, address from, address to, uint256[] memory ids, uint256[] memory values, bytes memory data) internal {
        if (to.code.length > 0) {
            try IERC1155Receiver(to).onERC1155BatchReceived(operator, from, ids, values, data) returns (bytes4 response) {
                if (response != IERC1155Receiver.onERC1155BatchReceived.selector) {
                    revert IERC1155Errors.ERC1155InvalidReceiver(to);
                }
            } catch (bytes memory reason) {
                if (reason.length == 0) {
                    revert IERC1155Errors.ERC1155InvalidReceiver(to);
                } else {
                    assembly ("memory-safe") { revert(add(32, reason), mload(reason)) }
                }
            }
        }
    }
}


// Contenuto di node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol
abstract contract ERC1155 is Context, ERC165, IERC1155, IERC1155MetadataURI, IERC1155Errors {
    using Arrays for uint256[];
    using Arrays for address[];

    mapping(uint256 id => mapping(address account => uint256)) private _balances;
    mapping(address account => mapping(address operator => bool)) private _operatorApprovals;
    string private _uri;

    constructor(string memory uri_) {
        _setURI(uri_);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
        return interfaceId == type(IERC1155).interfaceId || interfaceId == type(IERC1155MetadataURI).interfaceId || super.supportsInterface(interfaceId);
    }

    function uri(uint256 /* id */) public view virtual returns (string memory) {
        return _uri;
    }

    function balanceOf(address account, uint256 id) public view virtual returns (uint256) {
        return _balances[id][account];
    }

    function balanceOfBatch(address[] memory accounts, uint256[] memory ids) public view virtual returns (uint256[] memory) {
        if (accounts.length != ids.length) {
            revert ERC1155InvalidArrayLength(ids.length, accounts.length);
        }
        uint256[] memory batchBalances = new uint256[](accounts.length);
        for (uint256 i = 0; i < accounts.length; ++i) {
            batchBalances[i] = balanceOf(accounts.unsafeMemoryAccess(i), ids.unsafeMemoryAccess(i));
        }
        return batchBalances;
    }

    function setApprovalForAll(address operator, bool approved) public virtual {
        _setApprovalForAll(_msgSender(), operator, approved);
    }

    function isApprovedForAll(address account, address operator) public view virtual returns (bool) {
        return _operatorApprovals[account][operator];
    }

    function safeTransferFrom(address from, address to, uint256 id, uint256 value, bytes memory data) public virtual {
        address sender = _msgSender();
        if (from != sender && !isApprovedForAll(from, sender)) {
            revert ERC1155MissingApprovalForAll(sender, from);
        }
        _safeTransferFrom(from, to, id, value, data);
    }

    function safeBatchTransferFrom(address from, address to, uint256[] memory ids, uint256[] memory values, bytes memory data) public virtual {
        address sender = _msgSender();
        if (from != sender && !isApprovedForAll(from, sender)) {
            revert ERC1155MissingApprovalForAll(sender, from);
        }
        _safeBatchTransferFrom(from, to, ids, values, data);
    }

    function _update(address from, address to, uint256[] memory ids, uint256[] memory values) internal virtual {
        if (ids.length != values.length) {
            revert ERC1155InvalidArrayLength(ids.length, values.length);
        }
        address operator = _msgSender();
        for (uint256 i = 0; i < ids.length; ++i) {
            uint256 id = ids.unsafeMemoryAccess(i);
            uint256 value = values.unsafeMemoryAccess(i);
            if (from != address(0)) {
                uint256 fromBalance = _balances[id][from];
                if (fromBalance < value) {
                    revert ERC1155InsufficientBalance(from, fromBalance, value, id);
                }
                unchecked { _balances[id][from] = fromBalance - value; }
            }
            if (to != address(0)) {
                _balances[id][to] += value;
            }
        }
        if (ids.length == 1) {
            uint256 id = ids.unsafeMemoryAccess(0);
            uint256 value = values.unsafeMemoryAccess(0);
            emit TransferSingle(operator, from, to, id, value);
        } else {
            emit TransferBatch(operator, from, to, ids, values);
        }
    }

    function _updateWithAcceptanceCheck(address from, address to, uint256[] memory ids, uint256[] memory values, bytes memory data) internal virtual {
        _update(from, to, ids, values);
        if (to != address(0)) {
            address operator = _msgSender();
            if (ids.length == 1) {
                uint256 id = ids.unsafeMemoryAccess(0);
                uint256 value = values.unsafeMemoryAccess(0);
                ERC1155Utils.checkOnERC1155Received(operator, from, to, id, value, data);
            } else {
                ERC1155Utils.checkOnERC1155BatchReceived(operator, from, to, ids, values, data);
            }
        }
    }

    function _safeTransferFrom(address from, address to, uint256 id, uint256 value, bytes memory data) internal {
        if (to == address(0)) { revert ERC1155InvalidReceiver(address(0)); }
        if (from == address(0)) { revert ERC1155InvalidSender(address(0)); }
        (uint256[] memory ids, uint256[] memory values) = _asSingletonArrays(id, value);
        _updateWithAcceptanceCheck(from, to, ids, values, data);
    }

    function _safeBatchTransferFrom(address from, address to, uint256[] memory ids, uint256[] memory values, bytes memory data) internal {
        if (to == address(0)) { revert ERC1155InvalidReceiver(address(0)); }
        if (from == address(0)) { revert ERC1155InvalidSender(address(0)); }
        _updateWithAcceptanceCheck(from, to, ids, values, data);
    }

    function _setURI(string memory newuri) internal virtual {
        _uri = newuri;
    }

    function _mint(address to, uint256 id, uint256 value, bytes memory data) internal {
        if (to == address(0)) { revert ERC1155InvalidReceiver(address(0)); }
        (uint256[] memory ids, uint256[] memory values) = _asSingletonArrays(id, value);
        _updateWithAcceptanceCheck(address(0), to, ids, values, data);
    }

    function _mintBatch(address to, uint256[] memory ids, uint256[] memory values, bytes memory data) internal {
        if (to == address(0)) { revert ERC1155InvalidReceiver(address(0)); }
        _updateWithAcceptanceCheck(address(0), to, ids, values, data);
    }

    function _burn(address from, uint256 id, uint256 value) internal {
        if (from == address(0)) { revert ERC1155InvalidSender(address(0)); }
        (uint256[] memory ids, uint256[] memory values) = _asSingletonArrays(id, value);
        _updateWithAcceptanceCheck(from, address(0), ids, values, "");
    }

    function _burnBatch(address from, uint256[] memory ids, uint256[] memory values) internal {
        if (from == address(0)) { revert ERC1155InvalidSender(address(0)); }
        _updateWithAcceptanceCheck(from, address(0), ids, values, "");
    }

    function _setApprovalForAll(address owner, address operator, bool approved) internal virtual {
        if (operator == address(0)) { revert ERC1155InvalidOperator(address(0)); }
        _operatorApprovals[owner][operator] = approved;
        emit ApprovalForAll(owner, operator, approved);
    }

    function _asSingletonArrays(uint256 element1, uint256 element2) private pure returns (uint256[] memory array1, uint256[] memory array2) {
        assembly ("memory-safe") {
            array1 := mload(0x40)
            mstore(array1, 1)
            mstore(add(array1, 0x20), element1)
            array2 := add(array1, 0x40)
            mstore(array2, 1)
            mstore(add(array2, 0x20), element2)
            mstore(0x40, add(array2, 0x40))
        }
    }
}


/**
 * @dev String operations.
 */
library Strings {
    bytes16 private constant _HEX_SYMBOLS = "0123456789abcdef";
    uint8 private constant _ADDRESS_LENGTH = 20;

    /**
     * @dev Converts a `uint256` to its ASCII `string` decimal representation.
     */
    function toString(uint256 value) internal pure returns (string memory) {
        // Inspired by OraclizeAPI's implementation - MIT licence
        // https://github.com/oraclize/ethereum-api/blob/b42146b063c7d6ee1358846c198246239e9360e8/oraclizeAPI_0.4.25.sol
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    /**
     * @dev Converts a `uint256` to its ASCII `string` hexadecimal representation.
     */
    function toHexString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0x00";
        }
        uint256 temp = value;
        uint256 length = 0;
        while (temp != 0) {
            length++;
            temp >>= 8;
        }
        return toHexString(value, length);
    }

    /**
     * @dev Converts a `uint256` to its ASCII `string` hexadecimal representation with fixed length.
     */
    function toHexString(uint256 value, uint256 length) internal pure returns (string memory) {
        bytes memory buffer = new bytes(2 * length + 2);
        buffer[0] = "0";
        buffer[1] = "x";
        for (uint256 i = 2 * length + 1; i > 1; --i) {
            buffer[i] = _HEX_SYMBOLS[value & 0xf];
            value >>= 4;
        }
        require(value == 0, "Strings: hex length insufficient");
        return string(buffer);
    }

    /**
     * @dev Converts an `address` with fixed length of 20 bytes to its not checksummed ASCII `string` hexadecimal representation.
     */
    function toHexString(address addr) internal pure returns (string memory) {
        return toHexString(uint256(uint160(addr)), _ADDRESS_LENGTH);
    }
}


// Contenuto di node_modules/@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol
abstract contract ERC1155URIStorage is ERC1155 {
    using Strings for uint256;
    string private _baseURI = "";
    mapping(uint256 tokenId => string) private _tokenURIs;

    function uri(uint256 tokenId) public view virtual override returns (string memory) {
        string memory tokenURI = _tokenURIs[tokenId];
        return bytes(tokenURI).length > 0 ? string.concat(_baseURI, tokenURI) : super.uri(tokenId);
    }

    function _setURI(uint256 tokenId, string memory tokenURI) internal virtual {
        _tokenURIs[tokenId] = tokenURI;
        emit URI(uri(tokenId), tokenId);
    }

    function _setBaseURI(string memory baseURI) internal virtual {
        _baseURI = baseURI;
    }
}


// Contenuto di contracts/LHISALecceNFT.sol

// NOME DELLA CLASSE DEL CONTRATTO CORRETTO: con underscore
contract LHISA_LecceNFT is ERC1155URIStorage, Ownable {
    string public name = "LHISA-LecceNFT"; // Nome pubblico del token/collezione (con trattino)
    string public symbol = "LHISA"; // Simbolo pubblico del token

    mapping(uint256 => uint256) public maxSupply;
    mapping(uint256 => uint256) public totalMinted;
    mapping(uint256 => uint256) public pricesInWei;
    mapping(uint256 => bool) public isValidTokenId;
    mapping(uint256 => string) public encryptedURIs;
    mapping(uint256 => string) public tokenCIDs;

    address public withdrawWallet;
    address public creatorWallet;
    uint256 public creatorSharePercentage;

    struct Proposal {
        string description;
        uint256 startTime;
        uint256 endTime;
        uint256 yesVotes;
        uint256 noVotes;
        bool active;
        bool allowNewMintsToVote;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    uint256 public nextProposalId;

    struct BurnRequest {
        address requester;
        uint256 tokenId;
        uint256 quantity;
        bool approved;
    }

    BurnRequest[] public burnRequests;

    uint256 public constant MINIMUM_TOTAL_VALUE = 84_000 ether;

    event NFTMinted(address indexed buyer, uint256 tokenId, uint256 quantity, uint256 price, string encryptedURI);
    event FundsWithdrawn(address indexed owner, uint256 amount);
    event BaseURIUpdated(string newBaseURI);
    event NFTBurned(address indexed owner, uint256 tokenId, uint256 quantity);
    event BurnRequested(address indexed requester, uint256 tokenId, uint256 quantity, uint256 requestId);
    event BurnApproved(uint256 requestId, address indexed requester, uint256 tokenId, uint256 quantity);
    event BurnDenied(uint256 requestId, address indexed requester, uint256 tokenId, uint256 quantity);

    event CreatorShareTransferred(address indexed receiver, uint256 amount);

    event ProposalCreated(uint256 indexed proposalId, string description, uint256 startTime, uint256 endTime);
    event Voted(uint256 indexed proposalId, address indexed voter, bool vote);

    // Il costruttore ora prende _owner (deployer) e _creatorWalletAddress come parametri
    // Contenuto corretto del costruttore nel file contracts/LHISA_LecceNFT.sol
    constructor(string memory _baseURI, address _ownerAddress, address _creatorWalletAddress)
        ERC1155(_baseURI)
        Ownable(_ownerAddress) // Owner è il parametro _ownerAddress
    {
        require(bytes(_baseURI).length > 0, "Base URI cannot be empty");
        require(_ownerAddress != address(0), "Owner address cannot be zero"); // Controllo aggiuntivo
        require(_creatorWalletAddress != address(0), "Creator wallet address cannot be zero"); // Controllo aggiuntivo

        withdrawWallet = _ownerAddress; // withdrawWallet coincide con l'owner (deployer)
        creatorWallet = _creatorWalletAddress; // creatorWallet è passato come parametro
        creatorSharePercentage = 6; // Percentuale è ancora 6%
        nextProposalId = 0; // Inizializzazione di nextProposalId CORRETTA

        // --- Definizione dei prezzi, maxSupply (2000) e tokenId validi ---
        // Questo blocco DEVE essere all'interno del costruttore
        for (uint256 i = 5; i <= 100; i += 5) {
            pricesInWei[i] = i * 4 * 10**16;
            maxSupply[i] = 2000; // maxSupply aggiornata a 2000
            isValidTokenId[i] = true;
        }

        // --- Inizializzazione degli URI/CID per i 20 token (pubblici e non crittografati) ---
        // Questo blocco DEVE essere all'interno del costruttore
        encryptedURIs[100] = "bafybeibzvith6ji34mzhb7mgdtascuhvczxvg3yyt73prlzg7n4f56qhhe";
        tokenCIDs[100] = "bafybeibzvith6ji34mzhb7mgdtascuhvczxvg3yyt3prlzg7n4f56qhhe"; // Corretto
        encryptedURIs[95] = "bafybeiarkwmmlxudlutqyw6jhrln3kkq7uzhendqnmhrtvtsu5gyrz62hm";
        tokenCIDs[95] = "bafybeiarkwmmlxudlutqyw6jhrln3kkq7uzhendqnmhrtvtsu5gyrz62hm";
        encryptedURIs[90] = "bafybeides3vx3ibatjjrm3wr22outg6gxclmsnerkydx3njjcm64tik3we";
        tokenCIDs[90] = "bafybeides3vx3ibatjjrm3wr22outg6gxclmsnerkydx3njjcm64tik3we";
        encryptedURIs[85] = "bafybeif4pdz2jhwlgnnonqti7reqyvszwjja45uimijzd47coilmj6jmvm";
        tokenCIDs[85] = "bafybeif4pdz2jhwlgnnonqti7reqyvszwjja45uimijzd47coilmj6jmvm";
        encryptedURIs[80] = "bafybeiboe3heopn3ki57hkbdkb4uep6mvbwlcyh4q6frcl2fqnmucswp3u";
        tokenCIDs[80] = "bafybeiboe3heopn3ki57hkbdkb4uep6mvbwlcyh4q6frcl2fqnmucswp3u";
        encryptedURIs[75] = "bafybeicgqdtiilzd23o2hhvb2kxfshjnyvxnwcic7eyftjfpalkokvm7di";
        tokenCIDs[75] = "bafybeicgqdtiilzd23o2hhvb2kxfshjnyvxnwcic7eyftjfpalkokvm7di";
        encryptedURIs[70] = "bafybeih6gfu4hss72sqjoszdsla6mioo2fbaam2jeqn7y6saihydtvjqam";
        tokenCIDs[70] = "bafybeih6gfu4hss72sqjoszdsla6mioo2fbaam2jeqn7y6saihydtvjqam";
        encryptedURIs[65] = "bafybeidyqyawcirrqbauf3daygvgmoqzq63duhsl6auw7fbfma4xlnj7cy";
        tokenCIDs[65] = "bafybeidyqyawcirrqbauf3daygvgmoqzq63duhsl6auw7fbfma4xlnj7cy";
        encryptedURIs[60] = "bafybeift6clex5dhe6unqqhcstdn4l3votj5uvuoiwpa5rwlsh6jovpeti";
        tokenCIDs[60] = "bafybeift6clex5dhe6unqqhcstdn4l3votj5uvuoiwpa5rwlsh6jovpeti";
        encryptedURIs[55] = "bafybeihhmmci3qjz55j3g5y33yhszt5fpbwmsnx4fbzklgkyofhsxn3bte";
        tokenCIDs[55] = "bafybeihhmmci3qjz55j3g5y33yhszt5fpbwmsnx4fbzklgkyofhsxn3bte";
        encryptedURIs[50] = "bafybeiaexxgiukd46px63gjvggltykt3uoqs74ryvj5x577uvge66ntr2q";
        tokenCIDs[50] = "bafybeiaexxgiukd46px63gjvggltykt3uoqs74ryvj5x577uvge66ntr2q";
        encryptedURIs[45] = "bafybeicspxdws7au6kdms6lfpfhggqxdpfkrzmrvsue7kvii5ncfk7d7tq";
        tokenCIDs[45] = "bafybeicspxdws7au6kdms6lfpfhggqxdpfkrzmrvsue7kvii5ncfk7d7tq";
        encryptedURIs[40] = "bafybeibuga3bq442mvnqrjyazhbhd2k3oek3bgevaja7jxla5to72cqeri";
        tokenCIDs[40] = "bafybeibuga3bq442mvnqrjyazhbhd2k3oek3bgevaja7jxla5to72cqeri";
        encryptedURIs[35] = "bafybeif2titfww7kqsggfocbtmm6smu5qmw7hwthaahaxjc7xzs2yf5yqq";
        tokenCIDs[35] = "bafybeif2titfww7kqsggfocbtmm6smu5qmw7hwthaahaxjc7xzs2yf5yqq";
        encryptedURIs[30] = "bafybeieqbykqxdjskgch5vtgkucvyvrbjtucpid47lwa3r3aejjc3xvbda";
        tokenCIDs[30] = "bafybeieqbykqxdjskgch5vtgkucvyvrbjtucpid47lwa3r3aejjc3xvbda";
        encryptedURIs[25] = "bafybeibo26hejdplqocrgxtg33lgdasqjuzzwkbs6cdrg7hdrkhehskukm";
        tokenCIDs[25] = "bafybeibo26hejdplqocrgxtg33lgdasqjuzzwkbs6cdrg7hdrkhehskukm";
        encryptedURIs[20] = "bafybeibk63t4vnlqpimomeeylnam2b52qdfdcx5bcfdxqtyiod2d6qnomy";
        tokenCIDs[20] = "bafybeibk63t4vnlqpimomeeylnam2b52qdfdcx5bcfdxqtyiod2d6qnomy";
        encryptedURIs[15] = "bafybeiek35bzmmhop35isxwade6ezfgsb466mhwoxr27zfwlly7etvpqo4";
        tokenCIDs[15] = "bafybeiek35bzmmhop35isxwade6ezfgsb466mhwoxr27zfwlly7etvpqo4";
        encryptedURIs[10] = "bafybeigpqqaoft52a7dp2kkzcn5zapig7zgftcfrt2fbiqqnm55mwut6lq";
        tokenCIDs[10] = "bafybeigpqqaoft52a7dp2kkzcn5zapig7zgftcfrt2fbiqqnm55mwut6lq";
        encryptedURIs[5] = "bafybeickzstleqd6hnjcsvp7bjc6tbsu7jqhmwzubws5qu7r64e3h4zhyq";
        tokenCIDs[5] = "bafybeickzstleqd6hnjcsvp7bjc6tbsu7jqhmwzubws5qu7r64e3h4zhyq";
    } // QUESTA È LA PARENTESI DI CHIUSURA CORRETTA DEL COSTRUTTORE!}

    function mintNFT(uint256 tokenId, uint256 quantity) external payable {
        require(isValidTokenId[tokenId], "Invalid tokenId");
        require(totalMinted[tokenId] + quantity <= maxSupply[tokenId], "Exceeds max supply");
        require(quantity > 0, "Invalid quantity");

        uint256 totalCostInWei = pricesInWei[tokenId] * quantity;
        require(msg.value == totalCostInWei, "Incorrect ETH amount");

        uint256 creatorShare = (totalCostInWei * creatorSharePercentage) / 100;

        if (creatorShare > 0) {
            (bool successCreator, ) = creatorWallet.call{value: creatorShare}("");
            require(successCreator, "Failed to send creator share");
            emit CreatorShareTransferred(creatorWallet, creatorShare);
        }

        totalMinted[tokenId] += quantity;
        _mint(msg.sender, tokenId, quantity, "");

        if (nextProposalId > 0 && proposals[nextProposalId - 1].active) {
            Proposal storage currentProposal = proposals[nextProposalId - 1];
            if (currentProposal.allowNewMintsToVote) {
                if (!hasVoted[nextProposalId - 1][msg.sender]) {
                    currentProposal.yesVotes += 1;
                    hasVoted[nextProposalId - 1][msg.sender] = true;
                    emit Voted(nextProposalId - 1, msg.sender, true);
                }
            }
        }
        emit NFTMinted(msg.sender, tokenId, quantity, pricesInWei[tokenId], encryptedURIs[tokenId]);
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        require(isValidTokenId[tokenId], "Invalid tokenId");
        require(bytes(tokenCIDs[tokenId]).length > 0, "Invalid tokenId CID");
        return string(abi.encodePacked("ipfs://", tokenCIDs[tokenId]));
    }

    function getEncryptedURI(uint256 tokenId) external view returns (string memory) {
        require(isValidTokenId[tokenId], "Invalid tokenId");
        return encryptedURIs[tokenId];
    }

    function withdrawFunds() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        payable(withdrawWallet).transfer(balance);
        emit FundsWithdrawn(withdrawWallet, balance);
    }

    function setCreatorWallet(address _newCreatorWallet) external onlyOwner {
        creatorWallet = _newCreatorWallet;
    }

    function setCreatorSharePercentage(uint256 _newCreatorSharePercentage) external onlyOwner {
        require(_newCreatorSharePercentage <= 100, "Creator share cannot exceed 100%");
        creatorSharePercentage = _newCreatorSharePercentage;
    }

    function setBaseURI(string memory newBaseURI) external onlyOwner {
        _setURI(newBaseURI);
        emit BaseURIUpdated(newBaseURI);
    }

    function setTokenCID(uint256 tokenId, string memory cid) external onlyOwner {
        require(isValidTokenId[tokenId], "TokenId not valid for setting CID");
        tokenCIDs[tokenId] = cid;
    }

    function setEncryptedURI(uint256 tokenId, string memory uri_) external onlyOwner {
        require(isValidTokenId[tokenId], "TokenId not valid for setting encrypted URI");
        encryptedURIs[tokenId] = uri_;
    }

    function createProposal(string memory _description, uint256 _durationInDays, bool _allowNewMintsToVote) external onlyOwner returns (uint256) {
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_durationInDays > 0, "Duration must be at least one day");

        uint256 proposalId = nextProposalId;
        proposals[proposalId] = Proposal({
            description: _description,
            startTime: block.timestamp,
            endTime: block.timestamp + (_durationInDays * 1 days),
            yesVotes: 0,
            noVotes: 0,
            active: true,
            allowNewMintsToVote: _allowNewMintsToVote
        });
        nextProposalId++;
        emit ProposalCreated(proposalId, _description, block.timestamp, block.timestamp + (_durationInDays * 1 days));
        return proposalId;
    }

    function vote(uint256 _proposalId, bool _vote) external { // <--- Funzione vote come ESTERNA
        Proposal storage proposal = proposals[_proposalId];

        require(proposal.active, "Proposal is not active");
        require(block.timestamp >= proposal.startTime, "Voting has not started yet");
        require(block.timestamp <= proposal.endTime, "Voting has ended");
        require(!hasVoted[_proposalId][msg.sender], "You have already voted on this proposal");

        uint256 totalNFTsOwned = 0;
        for (uint256 i = 5; i <= 100; i += 5) {
            totalNFTsOwned += balanceOf(msg.sender, i);
        }

        require(totalNFTsOwned > 0, "You must own at least one NFT to vote");

        if (_vote) {
            proposal.yesVotes += 1;
        } else {
            proposal.noVotes += 1;
        }
        hasVoted[_proposalId][msg.sender] = true;
        emit Voted(_proposalId, msg.sender, _vote);
    }

    function endProposal(uint256 _proposalId) external onlyOwner {
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.active, "Proposal is not active");
        require(block.timestamp > proposal.endTime, "Voting period has not ended yet");
        proposal.active = false;
    }

    function getProposalResults(uint256 _proposalId) external view returns (string memory description, uint256 yesVotes, uint256 noVotes, bool active, uint256 endTime) {
        Proposal storage proposal = proposals[_proposalId];
        return (proposal.description, proposal.yesVotes, proposal.noVotes, proposal.active, proposal.endTime);
    }

    function requestBurn(uint256 tokenId, uint256 quantity) external {
        require(isValidTokenId[tokenId], "Invalid tokenId");
        require(balanceOf(msg.sender, tokenId) >= quantity, "Insufficient balance");

        burnRequests.push(BurnRequest({
            requester: msg.sender,
            tokenId: tokenId,
            quantity: quantity,
            approved: false
        }));

        uint256 requestId = burnRequests.length - 1;
        emit BurnRequested(msg.sender, tokenId, quantity, requestId);
    }

    function approveBurn(uint256 requestId, bool approve) external onlyOwner {
        require(requestId < burnRequests.length, "Invalid requestId");
        BurnRequest storage request = burnRequests[requestId];
        require(!request.approved, "Request already processed");

        if (approve) {
            uint256 totalValueAfterBurn = calculateTotalValueAfterBurn(request.tokenId, request.quantity);
            require(totalValueAfterBurn >= MINIMUM_TOTAL_VALUE, "Cannot burn below minimum total value");

            _burn(request.requester, request.tokenId, request.quantity);
            totalMinted[request.tokenId] -= request.quantity;
            request.approved = true;

            emit BurnApproved(requestId, request.requester, request.tokenId, request.quantity);
        } else {
            emit BurnDenied(requestId, request.requester, request.tokenId, request.quantity);
        }
    }

    function calculateTotalValueAfterBurn(uint256 tokenId, uint256 quantity) public view returns (uint256) {
        uint256 totalValue = 0;

        uint256[] memory mintedTokens = new uint256[](20);
        uint256 idx = 0;
        for (uint256 i = 5; i <= 100; i += 5) {
            mintedTokens[idx] = totalMinted[i];
            idx++;
        }

        uint256 tokenArrayIndex = (tokenId / 5) - 1;
        require(tokenArrayIndex < 20, "Token ID not in burn calculation range");

        mintedTokens[tokenArrayIndex] -= quantity;

        idx = 0;
        for (uint256 i = 5; i <= 100; i += 5) {
            totalValue += mintedTokens[idx] * pricesInWei[i];
            idx++;
        }

        return totalValue;
    }

    function onlyOwnerFunction() external view {
        require(msg.sender == owner(), "Ownable: caller is not the owner");
    }
}
