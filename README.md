# Information about SwaggerFilter

## Introduction
  SwaggerFilter is an application that allows users to upload Swagger files (in JSON or YAML format), view all endpoints grouped by method, select endpoints to update, and download the updated Swagger file in the desired format (JSON or YAML). The application utilizes AWS S3 for storing the uploaded Swagger files and session storage to retain the selected endpoints when the same Swagger file is re-uploaded.

## Features
  - Upload Swagger files in JSON or YAML format.
  - View endpoints grouped by HTTP methods.
  - Download the updated Swagger file in JSON or YAML format.
  - Persistent storage using AWS S3 and session storage

## Prerequisites
  Before you begin, ensure you have the following:
  - AWS account with S3 bucket configured.
  - AWS access key and secret access key.
  - Swagger file (JSON or YAML format).

## Configuration

1. **AWS S3 Configuration:**
   - Set up an S3 bucket in your AWS account.
   - Note down the bucket name, AWS access key, and AWS secret access key.
   - Add prefix if you would like to add it in seperate folder in s3

2. **Environment Variables:**
   - Configure the following environment variables (developmenet.properties, deployment.properties) in your application environment:
     ```plaintext

     connector.aws-s3-connector.default.aws.accessKey=
     connector.aws-s3-connector.default.aws.accessSecret=
     connector.aws-s3-connector.default.aws.bucketName=
     connector.aws-s3-connector.default.aws.clientRegion=
     app.environment.file.prefix=
     app.environment.s3.region.domain=s3.amazonaws.com
     ```

## Installation

   - Once you get the source from MarketPlace.
   - Import into WaveMaker studio.
 
## Usage

1. **Upload Swagger File:**
   - Drag & Drop or Select the your Swagger file (JSON or YAML).

2. **View and Select Endpoints:**
   - Once uploaded, the application will display all endpoints grouped by HTTP methods.
   - Select the endpoints you want to update.

3. **Session Storage:**
   - If you upload the same Swagger file again, the application will retain your previously selected endpoints using session storage.

4. **Download Updated Swagger File:**
   - After selecting the endpoints, choose the format (JSON or YAML) for the updated Swagger file.
   - Click the download button to get the updated Swagger file.

## Example Workflow

1. **Upload a Swagger File:**
   - Click on the 'Choose file or drag it here' button or drag your file.
   - Choose a Swagger file (`swagger.json` or `swagger.yaml`).

2. **Select Endpoints:**
   - Browse through the endpoints displayed.
   - Check the boxes for the endpoints you wish to update.

3. **Download Updated File:**
   - Select the desired output format (JSON or YAML).
   - Click on the 'Download' button.
