"""
Test suite for the scientific calculator.

All tests represent correct expected behavior.
The implementation has bugs that need to be fixed.
"""
import pytest
from calculator import Calculator
from statistics import calculate_mean, calculate_median, calculate_std_dev
from conversions import celsius_to_fahrenheit, fahrenheit_to_celsius
from expression import evaluate_expression


@pytest.fixture
def calc():
    """Provide a fresh calculator instance."""
    return Calculator()


# ==================== Basic Operations ====================

class TestBasicOperations:
    """Tests for basic arithmetic operations."""
    
    def test_basic_addition(self, calc):
        """Addition should work correctly."""
        assert calc.add(2, 3) == 5
        assert calc.add(-1, 1) == 0
        assert calc.add(0.5, 0.5) == 1.0
    
    def test_basic_subtraction(self, calc):
        """Subtraction should work correctly."""
        assert calc.subtract(5, 3) == 2
        assert calc.subtract(3, 5) == -2
        assert calc.subtract(0, 0) == 0
    
    def test_basic_multiplication(self, calc):
        """Multiplication should work correctly."""
        assert calc.multiply(3, 4) == 12
        assert calc.multiply(-2, 3) == -6
        assert calc.multiply(0, 100) == 0
    
    def test_basic_division(self, calc):
        """Division should work correctly."""
        assert calc.divide(10, 2) == 5
        assert calc.divide(7, 2) == 3.5
        assert calc.divide(-6, 2) == -3
    
    def test_division_by_zero(self, calc):
        """Division by zero should raise ValueError."""
        with pytest.raises(ValueError, match="Cannot divide by zero"):
            calc.divide(10, 0)


# ==================== Statistical Functions ====================

class TestStatistics:
    """Tests for statistical functions."""
    
    def test_mean_normal(self):
        """Mean of normal list should be correct."""
        assert calculate_mean([1, 2, 3, 4, 5]) == 3.0
        assert calculate_mean([10, 20, 30]) == 20.0
    
    def test_mean_empty_list(self):
        """Mean of empty list should raise ValueError."""
        with pytest.raises(ValueError, match="Cannot calculate mean of empty list"):
            calculate_mean([])
    
    def test_mean_single_element(self):
        """Mean of single element should be that element."""
        assert calculate_mean([42]) == 42.0
    
    def test_median_odd_count(self):
        """Median of odd-count list should be middle element."""
        assert calculate_median([1, 2, 3, 4, 5]) == 3
        assert calculate_median([1, 3, 2]) == 2
    
    def test_median_even_count(self):
        """Median of even-count list should be average of middle two."""
        assert calculate_median([1, 2, 3, 4]) == 2.5  # (2 + 3) / 2
        assert calculate_median([1, 2, 3, 4, 5, 6]) == 3.5  # (3 + 4) / 2
    
    def test_median_empty_list(self):
        """Median of empty list should raise ValueError."""
        with pytest.raises(ValueError):
            calculate_median([])
    
    def test_standard_deviation(self):
        """Standard deviation should be calculated correctly."""
        # Population std dev of [2, 4, 4, 4, 5, 5, 7, 9] is 2.0
        data = [2, 4, 4, 4, 5, 5, 7, 9]
        assert abs(calculate_std_dev(data) - 2.0) < 0.01
    
    def test_sample_standard_deviation(self):
        """Sample standard deviation should use n-1 denominator."""
        # Sample std dev of [2, 4, 4, 4, 5, 5, 7, 9] is ~2.138
        data = [2, 4, 4, 4, 5, 5, 7, 9]
        result = calculate_std_dev(data, population=False)
        assert abs(result - 2.138) < 0.01


# ==================== Temperature Conversions ====================

class TestTemperatureConversions:
    """Tests for temperature conversion functions."""
    
    def test_freezing_point_c_to_f(self):
        """0°C should equal 32°F."""
        assert celsius_to_fahrenheit(0) == 32
    
    def test_boiling_point_c_to_f(self):
        """100°C should equal 212°F."""
        assert celsius_to_fahrenheit(100) == 212
    
    def test_body_temp_c_to_f(self):
        """37°C should equal 98.6°F."""
        result = celsius_to_fahrenheit(37)
        assert abs(result - 98.6) < 0.1
    
    def test_freezing_point_f_to_c(self):
        """32°F should equal 0°C."""
        assert fahrenheit_to_celsius(32) == 0
    
    def test_boiling_point_f_to_c(self):
        """212°F should equal 100°C."""
        assert fahrenheit_to_celsius(212) == 100
    
    def test_temperature_conversion(self, calc):
        """Round-trip conversion should return original value."""
        original = 25
        fahrenheit = calc.convert_temperature(original, 'C', 'F')
        back_to_celsius = calc.convert_temperature(fahrenheit, 'F', 'C')
        assert abs(back_to_celsius - original) < 0.01


# ==================== Expression Evaluation ====================

class TestExpressionEvaluation:
    """Tests for expression parsing and evaluation."""
    
    def test_simple_addition(self, calc):
        """Simple addition expression."""
        assert calc.evaluate("2 + 3") == 5
    
    def test_simple_multiplication(self, calc):
        """Simple multiplication expression."""
        assert calc.evaluate("4 * 5") == 20
    
    def test_expression_precedence(self, calc):
        """Multiplication should have higher precedence than addition."""
        assert calc.evaluate("2 + 3 * 4") == 14
    
    def test_expression_precedence_complex(self, calc):
        """Complex expression with precedence."""
        # 10 - 2 * 3 + 4 = 10 - 6 + 4 = 8
        assert calc.evaluate("10 - 2 * 3 + 4") == 8
    
    def test_parentheses_override_precedence(self, calc):
        """Parentheses should override normal precedence."""
        assert calc.evaluate("(2 + 3) * 4") == 20
    
    def test_nested_parentheses(self, calc):
        """Nested parentheses should work correctly."""
        assert calc.evaluate("((2 + 3) * 2) + 1") == 11
    
    def test_division_in_expression(self, calc):
        """Division should have same precedence as multiplication."""
        # 12 / 3 * 2 = 4 * 2 = 8 (left-to-right for same precedence)
        assert calc.evaluate("12 / 3 * 2") == 8


# ==================== Memory Operations ====================

class TestMemoryOperations:
    """Tests for calculator memory functions."""
    
    def test_memory_store_and_recall(self, calc):
        """Memory should store and recall values."""
        calc.memory_store(42)
        assert calc.memory_recall() == 42
    
    def test_memory_clear(self, calc):
        """Memory clear should reset to zero."""
        calc.memory_store(100)
        calc.memory_clear()
        assert calc.memory_recall() == 0
    
    def test_memory_add(self, calc):
        """Memory add should accumulate values."""
        calc.memory_store(10)
        calc.memory_add(5)
        assert calc.memory_recall() == 15


# ==================== History ====================

class TestHistory:
    """Tests for calculation history."""
    
    def test_history_recording(self, calc):
        """Operations should be recorded in history."""
        calc.add(1, 2)
        calc.multiply(3, 4)
        history = calc.get_history()
        assert len(history) == 2
    
    def test_history_clear(self, calc):
        """Clear history should empty the list."""
        calc.add(1, 2)
        calc.clear_history()
        assert len(calc.get_history()) == 0
