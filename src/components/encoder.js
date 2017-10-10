
/**
 * Encoder for encoding and decoding keys in MongoDB
 */
class Encoder {
    /**
     * Encode file path for mongoDB
     */
    static encodeKey(key) {
        return key.replace(/\./g, 'uff0e').replace(/\$/g, 'uff04').replace(/\\/g, 'uff3c');
    }

    /**
     * Decode file path from mongoDB
     */
    static decodeKey(key) {
        return key.replace(/uff0e/g, ".").replace(/uff04/g, "\$").replace(/uff3c/g, "\\")
    }
}

module.exports = Encoder;