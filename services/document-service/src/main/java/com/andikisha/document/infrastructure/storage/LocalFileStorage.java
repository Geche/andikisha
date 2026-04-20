package com.andikisha.document.infrastructure.storage;

import com.andikisha.document.application.port.FileStorage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Development-only file storage implementation backed by the local filesystem.
 *
 * WARNING: The default path (./document-storage) is relative to the process
 * working directory and is ephemeral in containerised environments.
 * Override {@code app.storage.base-path} to a persistent volume mount path
 * before deploying to any non-development environment.
 * For production, replace this bean with an object-store implementation
 * (AWS S3, GCS, Azure Blob Storage).
 */
@Component
public class LocalFileStorage implements FileStorage {

    private static final Logger log = LoggerFactory.getLogger(LocalFileStorage.class);

    @Value("${app.storage.base-path:./document-storage}")
    private String basePath;

    @Override
    public String store(String path, byte[] content) {
        try {
            Path fullPath = Paths.get(basePath, path);
            Files.createDirectories(fullPath.getParent());
            Files.write(fullPath, content);
            log.debug("Stored file at {} ({} bytes)", fullPath, content.length);
            return fullPath.toString();
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + path, e);
        }
    }

    @Override
    public byte[] retrieve(String path) {
        try {
            Path fullPath = Paths.get(basePath, path);
            return Files.readAllBytes(fullPath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to retrieve file: " + path, e);
        }
    }

    @Override
    public void delete(String path) {
        try {
            Files.deleteIfExists(Paths.get(basePath, path));
        } catch (IOException e) {
            log.error("Failed to delete file: {}", path, e);
        }
    }

    @Override
    public boolean exists(String path) {
        return Files.exists(Paths.get(basePath, path));
    }
}
