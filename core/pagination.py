# core/pagination.py

from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class PaginacaoPadrao(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'paginacao': {
                'total':       self.page.paginator.count,
                'paginas':     self.page.paginator.num_pages,
                'pagina_atual': self.page.number,
                'proxima':     self.get_next_link(),
                'anterior':    self.get_previous_link(),
            },
            'resultados': data
        })