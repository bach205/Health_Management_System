"""
Crawler for LongChau medical website.
"""
#link lay chuyen de
#https://api.nhathuoclongchau.com.vn/lccus/prod-cms/api/v2/tags?limit=16&offset=16
#link lay bai viet
#https://api.nhathuoclongchau.com.vn/lccus/prod-cms/api/v2/tags/articles?tagSlug=chuyen-de%2Fdinh-duong&offset=0&limit=10

def crawl() -> list:
    """
    Crawl medical articles from LongChau website.
    
    Returns:
        list: List of crawled articles
    """
    articles = []
    # TODO: Implement LongChau crawling logic
    return articles 