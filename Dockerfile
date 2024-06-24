FROM tomcat:9.0.83-jdk11-temurin
COPY ./target/*.war /usr/local/tomcat/webapps/
