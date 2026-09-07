package com.kovax.zipalink.exception;

public class LinkNotFoundException extends RuntimeException {

    public LinkNotFoundException(String shortCode) {
        super("Nenhum link encontrado para o código: " + shortCode);
    }
}
