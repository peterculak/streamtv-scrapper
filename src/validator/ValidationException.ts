class ValidationException extends Error {
    static invalid(): ValidationException {
        return new ValidationException('Validation Exception Occured');
    }
}

export default ValidationException;
