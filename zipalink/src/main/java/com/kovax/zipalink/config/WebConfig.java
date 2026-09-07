package com.kovax.zipalink.config;

import org.springframework.context.annotation.Configuration;

/**
 * O CORS agora é configurado no SecurityConfig (CorsConfigurationSource + filter chain),
 * para garantir que preflights OPTIONS em rotas protegidas respondam antes da autenticação.
 */
@Configuration
public class WebConfig {
}

