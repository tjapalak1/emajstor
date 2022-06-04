package etf.unsa.ba.nwt.emajstor.user.dto;

public class RegisterDTO {
    private String email;
    private String name;

    public RegisterDTO() {
    }

    public RegisterDTO(String email, String name) {
        this.email = email;
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}