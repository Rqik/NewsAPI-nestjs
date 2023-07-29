import { Request } from 'express';
import querystring from 'querystring';

const paginator = ({
  totalCount,
  count,
  req,
  route,
  page,
  perPage,
  apiUrl,
}: {
  totalCount: number | null;
  count: number;
  req: Request<unknown, unknown, unknown, { per_page?: string; page?: string }>;
  route: string;
  page: number;
  perPage: number;
  apiUrl: string;
}) => {
  const pagination: {
    prevPage: string | null;
    nextPage: string | null;
    totalCount: number | null;
    count: number;
  } = {
    totalCount,
    count,
    nextPage: null,
    prevPage: null,
  };

  const addNextPageUrl =
    totalCount !== null && totalCount > (Number(page) + 1) * Number(perPage);

  if (addNextPageUrl) {
    pagination.nextPage = `${apiUrl}${route}?${querystring.stringify({
      ...req.query,
      per_page: perPage,
      page: page + 1,
    })}`;
  }

  if (page > 0) {
    pagination.prevPage = `${apiUrl}${route}?${querystring.stringify({
      ...req.query,
      per_page: perPage,
      page: page - 1,
    })}`;
  }

  return pagination;
};

export default paginator;
