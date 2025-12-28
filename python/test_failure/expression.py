"""
Expression parser and evaluator.
"""
import re
from typing import List, Union

Number = Union[int, float]


def evaluate_expression(expression: str) -> Number:
    """
    Evaluate a mathematical expression string.
    
    Supports: +, -, *, /, parentheses
    
    Args:
        expression: Mathematical expression string
        
    Returns:
        Result of evaluation
        
    Example:
        >>> evaluate_expression("2 + 3 * 4")
        14
        >>> evaluate_expression("(2 + 3) * 4")
        20
    """
    # Remove whitespace
    expression = expression.replace(" ", "")
    
    # Handle parentheses first (recursive)
    while "(" in expression:
        # Find innermost parentheses
        match = re.search(r'\(([^()]+)\)', expression)
        if match:
            inner = match.group(1)
            inner_result = evaluate_simple(inner)
            expression = expression[:match.start()] + str(inner_result) + expression[match.end():]
    
    return evaluate_simple(expression)


def evaluate_simple(expression: str) -> Number:
    """
    Evaluate a simple expression without parentheses.
    
    Evaluates left-to-right instead of respecting * / before + -
    
    Args:
        expression: Simple expression string
        
    Returns:
        Result of evaluation
    """
    # Tokenize
    tokens = tokenize(expression)
    
    if not tokens:
        raise ValueError("Empty expression")
    
    result = float(tokens[0])
    i = 1
    
    while i < len(tokens):
        operator = tokens[i]
        operand = float(tokens[i + 1])
        
        if operator == '+':
            result = result + operand
        elif operator == '-':
            result = result - operand
        elif operator == '*':
            result = result * operand
        elif operator == '/':
            if operand == 0:
                raise ValueError("Division by zero")
            result = result / operand
        else:
            raise ValueError(f"Unknown operator: {operator}")
        
        i += 2
    
    # Return int if whole number
    if result == int(result):
        return int(result)
    return result


def tokenize(expression: str) -> List[str]:
    """
    Tokenize a mathematical expression.
    
    Args:
        expression: Expression string
        
    Returns:
        List of tokens (numbers and operators)
    """
    tokens = []
    current_number = ""
    
    for char in expression:
        if char.isdigit() or char == '.':
            current_number += char
        elif char in "+-*/":
            if current_number:
                tokens.append(current_number)
                current_number = ""
            elif char == '-' and (not tokens or tokens[-1] in "+-*/"):
                # Handle negative numbers
                current_number = '-'
                continue
            tokens.append(char)
        else:
            raise ValueError(f"Invalid character: {char}")
    
    if current_number:
        tokens.append(current_number)
    
    return tokens


def validate_expression(expression: str) -> bool:
    """
    Validate an expression string.
    
    Args:
        expression: Expression to validate
        
    Returns:
        True if valid, False otherwise
    """
    # Check balanced parentheses
    depth = 0
    for char in expression:
        if char == '(':
            depth += 1
        elif char == ')':
            depth -= 1
            if depth < 0:
                return False
    
    if depth != 0:
        return False
    
    # Check for valid characters
    valid_chars = set("0123456789+-*/().() ")
    for char in expression:
        if char not in valid_chars:
            return False
    
    return True
