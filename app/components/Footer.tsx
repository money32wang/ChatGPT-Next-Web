// 服务器端组件
import React, { useState, useEffect } from "react";
import { UsersIcon } from "@/app/icons/UsersIcon";
import { CursorClickIcon } from "@/app/icons/CursorClickIcon";
import { kvKeys } from "@/app/config/kv";
import countries from "@/app/utils/countries.json";
import { redis } from "@/app/utils/redis";
import { prettifyNumber } from "@/app/utils/math";
import { Container } from "@/app/components/Container";

function TotalPageViews({ views }: { views: number }) {
  return (
    <span className="flex items-center justify-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 md:justify-start">
      <UsersIcon className="h-4 w-4" />
      <span title={`${Intl.NumberFormat("en-US").format(views)}次浏览`}>
        &nbsp;本站总浏览量&nbsp;
        <span className="font-medium">{prettifyNumber(views, true)}</span>
      </span>
    </span>
  );
}

type VisitorGeolocation = {
  country: string;
  city?: string;
  flag: string;
};

function LastVisitorInfo({
  lastVisitor,
}: {
  lastVisitor: VisitorGeolocation | undefined;
}) {
  if (!lastVisitor) {
    lastVisitor = {
      country: "US",
      flag: "🇺🇸",
    };
  }

  return (
    <span className="flex items-center justify-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 md:justify-start">
      <br />
      <CursorClickIcon className="h-4 w-4" />
      <span>
        &nbsp;最近访客来自&nbsp;
        {[lastVisitor.city, lastVisitor.country].filter(Boolean).join(", ")}
      </span>
      <span className="font-medium">{lastVisitor.flag}</span>
    </span>
  );
}

export function Footer() {
  const [totalPageViews, setTotalPageViews] = useState<number>(0);
  const [lastVisitor, setLastVisitor] = useState<
    VisitorGeolocation | undefined
  >(undefined);

  const fetchData = async () => {
    try {
      const views: number = await redis.incr(kvKeys.totalPageViews);
      setTotalPageViews(views);

      const [lv, cv]: [VisitorGeolocation | null, VisitorGeolocation | null] =
        await Promise.all([
          redis.get<VisitorGeolocation>(kvKeys.lastVisitor),
          redis.get<VisitorGeolocation>(kvKeys.currentVisitor),
        ]);
      setLastVisitor(lv!); // 使用非空断言操作符 !

      if (cv) {
        await redis.set(kvKeys.lastVisitor, cv);
      } else {
        // 如果 cv 为 null，则不执行设置操作
        console.log("Current visitor is null, not setting last visitor.");
      }
    } catch (error) {
      // 处理错误
      console.error("An error occurred while fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // 请注意这里的空依赖数组，以确保 useEffect 只会在组件挂载时执行一次

  return (
    <footer className="mt-32">
      <Container.Outer>
        <div className="border-t border-zinc-100 pb-16 pt-10 dark:border-zinc-700/40">
          <Container.Inner className="mt-6">
            <div className="flex flex-col items-center justify-start gap-2 sm:flex-row">
              <TotalPageViews views={totalPageViews} />
              <LastVisitorInfo lastVisitor={lastVisitor} />
            </div>
          </Container.Inner>
        </div>
      </Container.Outer>
    </footer>
  );
}
