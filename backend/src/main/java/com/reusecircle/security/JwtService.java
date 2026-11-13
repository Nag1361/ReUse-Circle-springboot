package com.reusecircle.security;


import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import com.reusecircle.entity.User;

@Service
public class JwtService {
    private final SecretKey key;
    private final long expirationMs;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.expiration-ms}") long expirationMs) {
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        this.expirationMs = expirationMs;
    }

    public String createToken(User user) {
        Date now = new Date();
        return Jwts.builder().subject(user.getId().toString()).issuedAt(now)
            .expiration(new Date(now.getTime() + expirationMs)).signWith(key).compact();
    }

    public Long getUserId(String token) {
        return Long.valueOf(Jwts.parser().verifyWith(key).build()
            .parseSignedClaims(token).getPayload().getSubject());
    }
}
