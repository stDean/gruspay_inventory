"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { formUrlQuery } from "@/lib/utils";
import { PaginationProps } from "@/lib/types";

export const Pagination = ({ totalPages, page }: PaginationProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleNavigation = (type: "prev" | "next") => {
    const pageNumber = type === "prev" ? page - 1 : page + 1;

    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "page",
      value: pageNumber.toString(),
    });

    router.push(newUrl, { scroll: false });
  };

  return (
    <div className="flex justify-between gap-3 px-4">
      <Button
        size="lg"
        variant="ghost"
        className="p-0 hover:bg-transparent"
        disabled={Number(page) <= 1}
        onClick={() => handleNavigation("prev")}
      >
        <Image
          src="/arrow-left.svg"
          alt="arrow"
          width={20}
          height={20}
          className="mr-2"
        />
        Prev
      </Button>

      <p className="text-14 flex items-center px-2">
        {page} / {totalPages}
      </p>

      <Button
        size="lg"
        variant="ghost"
        className="p-0 hover:bg-transparent"
        onClick={() => handleNavigation("next")}
        disabled={Number(page) >= totalPages}
      >
        Next
        <Image
          src="/arrow-left.svg"
          alt="arrow"
          width={20}
          height={20}
          className="ml-2 -scale-x-100"
        />
      </Button>
    </div>
  );
};
