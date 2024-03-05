import toast from "react-hot-toast";

export async function request<T>(
  url: string,
  options: Omit<RequestInit, "body"> & { body?: any } = {}
): Promise<T> {
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  };
  if (options.body && !(options.body instanceof FormData)) {
    options.body = JSON.stringify(options.body);
  }
  const finalOptions = Object.assign({}, defaultOptions, options);
  try {
    const response = await fetch(url, finalOptions);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const res = await response.json();
    if (res.error) {
      toast.error(res.error);
      throw new Error(res.error);
    } else {
      return res;
    }
  } catch (error) {
    throw error;
  }
}

export type IRequest = typeof request;
