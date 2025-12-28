# Scientific Calculator - Test Failures

## Difficulty: ⭐⭐
## Pillar: Test Failures

## What This Project Does (When Fixed)

A scientific calculator library that provides:
- Basic arithmetic with proper precedence
- Statistical functions (mean, median, standard deviation)
- Unit conversions (temperature, length, weight)
- Expression parsing and evaluation

## Symptoms

When you run `pytest`:
- Multiple tests fail across different modules
- Some failures are obvious, others are subtle
- Edge cases are not handled correctly
- The implementation looks reasonable but produces wrong results

```
FAILED test_calculator.py::test_mean_empty_list - ZeroDivisionError
FAILED test_calculator.py::test_median_even_count - AssertionError
FAILED test_calculator.py::test_temperature_conversion - AssertionError
FAILED test_calculator.py::test_expression_precedence - AssertionError
FAILED test_calculator.py::test_standard_deviation - AssertionError
```

## Expected Success State

```
$ pytest -v

test_calculator.py::test_basic_addition PASSED
test_calculator.py::test_basic_subtraction PASSED
test_calculator.py::test_basic_multiplication PASSED
test_calculator.py::test_basic_division PASSED
test_calculator.py::test_mean_normal PASSED
test_calculator.py::test_mean_empty_list PASSED
test_calculator.py::test_median_odd_count PASSED
test_calculator.py::test_median_even_count PASSED
test_calculator.py::test_celsius_to_fahrenheit PASSED
test_calculator.py::test_fahrenheit_to_celsius PASSED
test_calculator.py::test_temperature_conversion PASSED
test_calculator.py::test_expression_precedence PASSED
test_calculator.py::test_standard_deviation PASSED

========================= 13 passed in 0.05s =========================
```

## How to Verify Success

```bash
pip install pytest
pytest -v
```

All tests should pass. The tests themselves are correct - the implementation has bugs.

## What Makes This Realistic

- Off-by-one errors in statistical calculations
- Incorrect formula implementation (looks close but wrong)
- Edge case handling (empty lists, single elements)
- Operator precedence bugs in expression parsing
- Type conversion issues

The tests document correct behavior - fixing requires understanding mathematical intent, not just making tests pass with hacks.

## Files

- `calculator.py` - Main calculator implementation
- `statistics.py` - Statistical functions
- `conversions.py` - Unit conversion functions
- `expression.py` - Expression parser
- `test_calculator.py` - Comprehensive test suite
