package com.stakeholders.grpc;

import com.stakeholders.grpc.proto.*;
import com.stakeholders.service.UserService;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.beans.factory.annotation.Autowired;

@GrpcService
public class StakeholdersGrpcService extends StakeholdersServiceGrpc.StakeholdersServiceImplBase {

    private final UserService userService;

    @Autowired
    public StakeholdersGrpcService(UserService userService) {
        this.userService = userService;
    }

    @Override
    public void checkUserExists(CheckUserExistsRequest request, StreamObserver<CheckUserExistsResponse> responseObserver) {
        try {
            String username = request.getUsername();
            System.out.println("🔄 gRPC: Proveravam da li korisnik '" + username + "' postoji...");
            
            boolean exists = userService.getUserByUsername(username).isPresent();
            
            System.out.println("✅ gRPC: Korisnik '" + username + "' " + (exists ? "POSTOJI" : "NE POSTOJI"));
            
            CheckUserExistsResponse response = CheckUserExistsResponse.newBuilder()
                .setExists(exists)
                .build();
            
            responseObserver.onNext(response);
            responseObserver.onCompleted();
            
        } catch (Exception e) {
            System.err.println("❌ gRPC greška: " + e.getMessage());
            responseObserver.onError(e);
        }
    }

    @Override
    public void isUserBlocked(IsUserBlockedRequest request, StreamObserver<IsUserBlockedResponse> responseObserver) {
        try {
            String username = request.getUsername();
            System.out.println("🔄 gRPC: Proveravam da li je korisnik '" + username + "' blokiran...");
            
            boolean blocked = userService.getUserByUsername(username)
                .map(user -> user.isBlocked())
                .orElse(false);
            
            System.out.println("✅ gRPC: Korisnik '" + username + "' je " + (blocked ? "BLOKIRAN" : "AKTIVAN"));
            
            IsUserBlockedResponse response = IsUserBlockedResponse.newBuilder()
                .setBlocked(blocked)
                .build();
            
            responseObserver.onNext(response);
            responseObserver.onCompleted();
            
        } catch (Exception e) {
            System.err.println("❌ gRPC greška: " + e.getMessage());
            responseObserver.onError(e);
        }
    }

    @Override
    public void getUserRole(GetUserRoleRequest request, StreamObserver<GetUserRoleResponse> responseObserver) {
        try {
            String username = request.getUsername();
            System.out.println("🔄 gRPC: Dohvatam ulogu korisnika '" + username + "'...");
            
            String role = userService.getUserByUsername(username)
                .map(user -> user.getRole().toString())
                .orElse("");
            
            System.out.println("✅ gRPC: Uloga korisnika '" + username + "' je " + role);
            
            GetUserRoleResponse response = GetUserRoleResponse.newBuilder()
                .setRole(role)
                .build();
            
            responseObserver.onNext(response);
            responseObserver.onCompleted();
            
        } catch (Exception e) {
            System.err.println("❌ gRPC greška: " + e.getMessage());
            responseObserver.onError(e);
        }
    }
}

