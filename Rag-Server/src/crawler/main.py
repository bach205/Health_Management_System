"""
Main crawler module for orchestrating the crawling process.
"""

from typing import List
from .sites import vinmec, hellobacsi, longchau

def crawl_all_sites() -> List[dict]:
    """
    Crawl data from all supported medical websites.
    
    Returns:
        List[dict]: List of crawled medical articles
    """
    articles = []
    
    # Crawl from each site
    articles.extend(vinmec.crawl())
    articles.extend(hellobacsi.crawl())
    articles.extend(longchau.crawl())
    
    return articles

if __name__ == "__main__":
    articles = crawl_all_sites()
    print(f"Crawled {len(articles)} articles in total") 