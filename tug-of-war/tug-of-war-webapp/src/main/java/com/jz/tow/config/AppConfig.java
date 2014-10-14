package com.jz.tow.config;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;
import java.util.Queue;

import org.springframework.beans.factory.annotation.Autowire;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jz.tow.Game;
import com.jz.tow.handler.TowWebSocketHandler;
import com.jz.tow.util.EnvironmentPropertyPlaceholderConfigurer;
import com.mongodb.Mongo;


@Configuration
@EnableWebMvc
@EnableWebSocket
@ComponentScan(basePackages = "com.jz.tow")
public class AppConfig extends WebMvcConfigurerAdapter implements WebSocketConfigurer {

	@Autowired
	private TowWebSocketHandler towWebSocketHandler;
	
	@Bean
	public static EnvironmentPropertyPlaceholderConfigurer environmentPropertyPlaceholderConfigurer() {
		EnvironmentPropertyPlaceholderConfigurer eppc = new EnvironmentPropertyPlaceholderConfigurer();

		Resource location = new ClassPathResource("service.properties");
		eppc.setLocation(location);

		return eppc;
	}

	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		registry.addResourceHandler("/**").addResourceLocations("/public-resources/");
	}

	public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
		registry.addHandler(towWebSocketHandler, "/update");
	}

//	@Bean
//	public WebSocketHandler myHandler() {
//		return new towWebSocketHandler();
//	}

	@Bean
	public MongoTemplate mongoTemplate(MongoCredentials mongoCredentials) throws Exception {
		MongoTemplate template = new MongoTemplate(new Mongo(mongoCredentials.getHost(), mongoCredentials.getPort()), mongoCredentials.getName(), mongoCredentials.getUserCredentials());

		return template;
	}
	
	@Bean
	public Object lock() {
		return new Object();
	}
	
	@Bean
	public ObjectMapper objectMapper() {
		return new ObjectMapper();
	}
}
