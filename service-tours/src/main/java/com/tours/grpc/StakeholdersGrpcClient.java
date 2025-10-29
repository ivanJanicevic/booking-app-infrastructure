package com.tours.grpc;

import com.stakeholders.grpc.proto.*;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.stereotype.Service;

@Service
public class StakeholdersGrpcClient {

    @GrpcClient("stakeholders-service")
    private StakeholdersServiceGrpc.StakeholdersServiceBlockingStub stakeholdersServiceStub;

    public boolean checkUserExists(String username) {
        try {
            System.out.println("🔄 gRPC Client: Proveravam da li korisnik '" + username + "' postoji...");
            
            CheckUserExistsRequest request = CheckUserExistsRequest.newBuilder()
                .setUsername(username)
                .build();
            
            CheckUserExistsResponse response = stakeholdersServiceStub.checkUserExists(request);
            
            boolean exists = response.getExists();
            System.out.println("✅ gRPC Client: Korisnik '" + username + "' " + (exists ? "POSTOJI" : "NE POSTOJI"));
            
            return exists;
            
        } catch (Exception e) {
            System.err.println("❌ gRPC Client greška: " + e.getMessage());
            return true;
        }
    }

    public boolean isUserBlocked(String username) {
        try {
            System.out.println("🔄 gRPC Client: Proveravam da li je korisnik '" + username + "' blokiran...");
            
            IsUserBlockedRequest request = IsUserBlockedRequest.newBuilder()
                .setUsername(username)
                .build();
            
            IsUserBlockedResponse response = stakeholdersServiceStub.isUserBlocked(request);
            
            boolean blocked = response.getBlocked();
            System.out.println("✅ gRPC Client: Korisnik '" + username + "' je " + (blocked ? "BLOKIRAN" : "AKTIVAN"));
            
            return blocked;
            
        } catch (Exception e) {
            System.err.println("❌ gRPC Client greška: " + e.getMessage());
            return false;
        }
    }

    public String getUserRole(String username) {
        try {
            System.out.println("🔄 gRPC Client: Dohvatam ulogu korisnika '" + username + "'...");
            
            GetUserRoleRequest request = GetUserRoleRequest.newBuilder()
                .setUsername(username)
                .build();
            
            GetUserRoleResponse response = stakeholdersServiceStub.getUserRole(request);
            
            String role = response.getRole();
            System.out.println("✅ gRPC Client: Uloga korisnika '" + username + "' je " + role);
            
            return role;
            
        } catch (Exception e) {
            System.err.println("❌ gRPC Client greška: " + e.getMessage());
            return null;
        }
    }
}

