/*Copyright (c) 2022-2023 wavemaker.com All Rights Reserved.This software is the confidential and proprietary information of wavemaker.com You shall not disclose such Confidential Information and shall use it only in accordance with the terms of the source code license agreement you entered into with wavemaker.com*/
package com.wavemaker.swaggerfilter.model;


public class FileDetails {
    private String fileName;
    private String filePath;

    public FileDetails(String fileName, String filePath) {
        this.fileName = fileName;
        this.filePath = filePath;
    }

    // Getters and Setters (you can generate them automatically in most IDEs)
    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }
}