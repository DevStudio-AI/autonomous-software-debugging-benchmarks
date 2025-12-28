"""
Test data generation for pipeline testing.
"""
import random
import string
from typing import List, Dict, Any
import uuid


def generate_test_records(count: int) -> List[Dict[str, Any]]:
    """
    Generate test records for pipeline processing.
    
    Args:
        count: Number of records to generate
        
    Returns:
        List of test records
    """
    records = []
    
    for i in range(count):
        record = {
            'id': str(uuid.uuid4()),
            'sequence': i,
            'value': random.randint(1, 1000),
            'category': random.choice(['A', 'B', 'C', 'D']),
            'source': random.choice(['api', 'batch', 'stream']),
            'metadata': {
                'created': random.randint(1000000, 9999999),
                'version': '1.0'
            }
        }
        records.append(record)
    
    return records


def generate_invalid_records(count: int, invalid_ratio: float = 0.1) -> List[Dict[str, Any]]:
    """
    Generate test records with some invalid entries.
    
    Args:
        count: Total number of records
        invalid_ratio: Ratio of invalid records (0.0-1.0)
        
    Returns:
        List of test records (some invalid)
    """
    records = generate_test_records(count)
    
    # Make some records invalid
    invalid_count = int(count * invalid_ratio)
    invalid_indices = random.sample(range(count), invalid_count)
    
    for idx in invalid_indices:
        # Remove required field or set invalid value
        if random.random() < 0.5:
            del records[idx]['value']
        else:
            records[idx]['value'] = 'not_a_number'
    
    return records


def generate_large_record() -> Dict[str, Any]:
    """Generate a single large record for stress testing."""
    return {
        'id': str(uuid.uuid4()),
        'value': random.randint(1, 1000),
        'payload': ''.join(random.choices(string.ascii_letters, k=10000)),
        'tags': [f'tag_{i}' for i in range(100)],
        'nested': {
            'level1': {
                'level2': {
                    'level3': {
                        'data': list(range(1000))
                    }
                }
            }
        }
    }
