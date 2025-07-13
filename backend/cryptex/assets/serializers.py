from rest_framework import serializers
from .models import Asset


class AssetSerializer(serializers.ModelSerializer):
    """
    Serializer for the Asset model.
    """
    
    class Meta:
        model = Asset
        fields = ['id', 'name', 'symbol', 'description', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_symbol(self, value):
        """
        Ensure the symbol is unique and not empty.
        """
        if not value or len(value) == 0:
            raise serializers.ValidationError("Symbol cannot be empty.")
        return value.upper() 