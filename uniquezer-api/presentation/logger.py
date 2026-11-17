import logging
import sys

def setup_logger(name: str, labels: dict = None):
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )

    sys_handler = logging.StreamHandler(sys.stdout)
    sys_handler.setFormatter(formatter)
    logger.addHandler(sys_handler)
    return logger