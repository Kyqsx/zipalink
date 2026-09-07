package com.kovax.zipalink.exception;

public class EmailAlreadyExistsException extends RuntimeException {

    public EmailAlreadyExistsException(String email) {
        super("Já existe uma conta com o email: " + email);
    }
}
