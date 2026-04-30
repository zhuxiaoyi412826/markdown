package com.example.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.io.IOException;
import java.io.InputStream;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@RequestMapping("/api")
public class BijiController {

    private final ResourceLoader resourceLoader;
    private static final String CLASSPATH_BIJI_DIR = "classpath:static/biji/**";

    public BijiController(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    @GetMapping("/biji-files")
    public Map<String, Object> getBijiFiles() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Object> tree = buildTreeFromClasspath();
            response.put("success", true);
            response.put("tree", tree);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            e.printStackTrace();
        }
        return response;
    }

    private List<Object> buildTreeFromClasspath() throws IOException {
        List<Object> tree = new ArrayList<>();

        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        Resource[] resources = resolver.getResources(CLASSPATH_BIJI_DIR);

        // 用于构建树形结构
        Map<String, Map<String, Object>> folderMap = new LinkedHashMap<>();
        List<Map<String, Object>> fileList = new ArrayList<>();

        for (Resource resource : resources) {
            String resourcePath = resource.getURL().getPath();

            // 从路径中提取相对于 static/biji 的部分
            int bijiIndex = resourcePath.indexOf("static/biji");
            if (bijiIndex == -1) continue;

            String relativePath = resourcePath.substring(bijiIndex + "static/biji/".length());

            // 跳过根目录
            if (relativePath.isEmpty() || relativePath.equals("/")) continue;

            // URL 解码路径
            relativePath = URLDecoder.decode(relativePath, StandardCharsets.UTF_8);

            // 替换反斜杠为正斜杠
            relativePath = relativePath.replace("\\", "/");

            String[] parts = relativePath.split("/");

            if (parts.length == 1 && parts[0].toLowerCase().endsWith(".md")) {
                // 根目录下的文件
                String fileName = parts[0];
                Map<String, Object> fileItem = new HashMap<>();
                fileItem.put("type", "file");
                fileItem.put("name", fileName);
                fileItem.put("path", fileName);
                fileItem.put("title", fileName.replace(".md", ""));
                fileList.add(fileItem);
            } else if (parts.length >= 1) {
                // 文件夹
                String folderPath = parts[0];
                if (!folderMap.containsKey(folderPath)) {
                    Map<String, Object> folderItem = new HashMap<>();
                    folderItem.put("type", "folder");
                    folderItem.put("name", folderPath);
                    folderItem.put("path", folderPath);
                    folderItem.put("children", new ArrayList<>());
                    folderItem.put("hasChildren", false);
                    folderMap.put(folderPath, folderItem);
                }

                // 如果有子文件或子文件夹
                if (parts.length > 1) {
                    Map<String, Object> parentFolder = folderMap.get(folderPath);
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> children = (List<Map<String, Object>>) parentFolder.get("children");

                    String childName = parts[parts.length - 1];
                    String childPath = folderPath;
                    for (int i = 1; i < parts.length; i++) {
                        childPath += "/" + parts[i];
                    }

                    if (childName.toLowerCase().endsWith(".md")) {
                        // 子文件
                        Map<String, Object> fileItem = new HashMap<>();
                        fileItem.put("type", "file");
                        fileItem.put("name", childName);
                        fileItem.put("path", childPath);
                        fileItem.put("title", childName.replace(".md", ""));
                        children.add(fileItem);
                        parentFolder.put("hasChildren", true);
                    } else {
                        // 子文件夹
                        boolean found = false;
                        for (Map<String, Object> child : children) {
                            if (child.get("name").equals(childName)) {
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            Map<String, Object> childFolder = new HashMap<>();
                            childFolder.put("type", "folder");
                            childFolder.put("name", childName);
                            childFolder.put("path", childPath);
                            childFolder.put("children", new ArrayList<>());
                            childFolder.put("hasChildren", false);
                            children.add(childFolder);
                            parentFolder.put("hasChildren", true);
                        }
                    }
                }
            }
        }

        // 添加文件夹（按名称排序）
        List<String> sortedFolderNames = new ArrayList<>(folderMap.keySet());
        Collections.sort(sortedFolderNames, String::compareToIgnoreCase);

        for (String folderName : sortedFolderNames) {
            tree.add(folderMap.get(folderName));
        }

        // 添加根目录下的文件（按名称排序）
        fileList.sort(Comparator.comparing(m -> (String) m.get("name"), String::compareToIgnoreCase));
        tree.addAll(fileList);

        return tree;
    }

    @GetMapping("/biji-file/**")
    public ResponseEntity<Resource> getBijiFile(HttpServletRequest request) {
        try {
            // 获取完整路径（去掉 /api/biji-file/ 前缀）
            String requestUri = request.getRequestURI();
            String path = requestUri.substring("/api/biji-file/".length());

            // 解码 URL 编码的路径
            String decodedPath = URLDecoder.decode(path, StandardCharsets.UTF_8);

            // 替换反斜杠为正斜杠
            decodedPath = decodedPath.replace("\\", "/");

            // 转换为 classpath 资源路径
            String resourcePath = "classpath:static/biji/" + decodedPath;

            System.out.println("Request path: " + path);
            System.out.println("Decoded path: " + decodedPath);
            System.out.println("Resource path: " + resourcePath);

            Resource resource = resourceLoader.getResource(resourcePath);

            if (!resource.exists()) {
                System.out.println("File not found in classpath!");
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.TEXT_PLAIN_VALUE + ";charset=UTF-8")
                    .body(resource);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }
}