class ValidationException extends Error {
    static invalid(): ValidationException {
        return new this('Validation Exception Occurred');
    }
}

export default ValidationException;
