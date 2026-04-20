package com.andikisha.document.application.port;

import java.io.InputStream;

public interface FileStorage {

    String store(String path, byte[] content);

    byte[] retrieve(String path);

    void delete(String path);

    boolean exists(String path);
}