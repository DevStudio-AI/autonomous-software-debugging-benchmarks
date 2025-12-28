"""
Pipeline processing stages.
"""
from typing import List, Dict, Any
from abc import ABC, abstractmethod


class PipelineStage(ABC):
    """Base class for pipeline stages."""
    
    def __init__(self, metrics_collector):
        self.metrics = metrics_collector
    
    @property
    @abstractmethod
    def name(self) -> str:
        """Stage name for reporting."""
        pass
    
    @abstractmethod
    def process(self, records: List[Dict]) -> List[Dict]:
        """Process records through this stage."""
        pass


class IngestionStage(PipelineStage):
    """Initial ingestion stage - receives raw data."""
    
    @property
    def name(self) -> str:
        return "Ingestion"
    
    def process(self, records: List[Dict]) -> List[Dict]:
        """Ingest raw records."""
        processed = []
        for record in records:
            # Add ingestion metadata
            record['ingested_at'] = self.metrics.current_time()
            record['stage'] = 'ingested'
            processed.append(record)
        return processed


class ValidationStage(PipelineStage):
    """Validation stage - validates record format and content."""
    
    @property
    def name(self) -> str:
        return "Validation"
    
    def process(self, records: List[Dict]) -> List[Dict]:
        """Validate records."""
        valid_records = []
        
        for record in records:
            if self._validate(record):
                record['stage'] = 'validated'
                valid_records.append(record)
            else:
                self.metrics.increment_errors()
        
        return valid_records
    
    def _validate(self, record: Dict) -> bool:
        """Check if record is valid."""
        # Require id and value fields
        if 'id' not in record or 'value' not in record:
            return False
        
        # Value must be numeric
        try:
            float(record['value'])
            return True
        except (ValueError, TypeError):
            return False


class TransformStage(PipelineStage):
    """Transform stage - applies transformations to data."""
    
    def __init__(self, metrics_collector):
        super().__init__(metrics_collector)
        self._transform_cache = []
    
    @property
    def name(self) -> str:
        return "Transform"
    
    def process(self, records: List[Dict]) -> List[Dict]:
        """Transform records."""
        transformed = []
        
        for record in records:
            # Apply transformations
            transformed_record = self._transform(record)
            transformed.append(transformed_record)
            
            self._transform_cache.append(transformed_record)
        
        return transformed
    
    def _transform(self, record: Dict) -> Dict:
        """Apply transformation to a single record."""
        record = record.copy()
        
        # Normalize value
        value = float(record['value'])
        record['normalized_value'] = value / 100.0
        
        # Add transform metadata
        record['stage'] = 'transformed'
        record['transformed_at'] = self.metrics.current_time()
        
        return record


class OutputStage(PipelineStage):
    """Output stage - prepares records for final output."""
    
    @property
    def name(self) -> str:
        return "Output"
    
    def process(self, records: List[Dict]) -> List[Dict]:
        """Prepare records for output."""
        output_records = []
        
        for record in records:
            output_record = {
                'id': record['id'],
                'value': record.get('normalized_value', record.get('value')),
                'status': 'complete',
                'stage': 'output'
            }
            output_records.append(output_record)
        
        return output_records
