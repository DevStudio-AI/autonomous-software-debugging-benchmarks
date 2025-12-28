"""
Terminal color codes for output styling.
"""


class Colors:
    """ANSI color codes for terminal output."""
    
    # Standard colors
    RED = "\033[91m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    MAGENTA = "\033[95m"
    CYAN = "\033[96m"
    WHITE = "\033[97m"
    
    # Formatting
    BOLD = "\033[1m"
    UNDERLINE = "\033[4m"
    RESET = "\033[0m"
    
    # Background colors
    BG_RED = "\033[41m"
    BG_GREEN = "\033[42m"
    BG_YELLOW = "\033[43m"
    BG_BLUE = "\033[44m"
    
    @classmethod
    def colorize(cls, text: str, color: str) -> str:
        """
        Apply color to text.
        
        Args:
            text: Text to colorize
            color: Color attribute name
            
        Returns:
            Colorized text string
        """
        color_code = getattr(cls, color.upper(), cls.WHITE)
        return f"{color_code}{text}{cls.RESET}"
    
    @classmethod
    def temperature_color(cls, temp: int) -> str:
        """
        Get appropriate color for temperature.
        
        Args:
            temp: Temperature in Fahrenheit
            
        Returns:
            Color code string
        """
        if temp >= 90:
            return cls.RED
        elif temp >= 75:
            return cls.YELLOW
        elif temp >= 55:
            return cls.GREEN
        elif temp >= 35:
            return cls.CYAN
        else:
            return cls.BLUE
