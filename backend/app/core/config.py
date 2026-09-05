from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Peblo TV Mini API"
    
    DATABASE_URL: str = "sqlite:///./peblo_mini.db"

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return self.DATABASE_URL

    # JWT Settings
    SECRET_KEY: str = "supersecretkey_for_development_only_12345"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    class Config:
        case_sensitive = True
        env_file = "../.env"
        extra = "ignore"

settings = Settings()
