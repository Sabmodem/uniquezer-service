from dataclasses import dataclass
from typing import BinaryIO

@dataclass
class FileDataDTO:
    mime: str
    content: BinaryIO