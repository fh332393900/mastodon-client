"use client"

import { Swiper, SwiperSlide } from "swiper/react"
import type { Swiper as SwiperType } from "swiper"
import "swiper/css"
import type { mastodon } from "masto"

// swiper 仅在打开图片预览(轮播)时才需要，单独拆成懒加载子组件，
// 由 MediaImage 在 Dialog 打开后才渲染，避免拖累全站首屏与路由切换。
export function MediaSwiper({
  images,
  index,
  canNavigate,
  onSlideChange,
  onSwiper,
}: {
  images: mastodon.v1.MediaAttachment[]
  index: number
  canNavigate: boolean
  onSlideChange: (realIndex: number) => void
  onSwiper: (swiper: SwiperType | null) => void
}) {
  return (
    <Swiper
      className="h-full w-full"
      onSwiper={onSwiper}
      onSlideChange={(instance) => onSlideChange(instance.realIndex)}
      loop={canNavigate}
      allowTouchMove={canNavigate}
      initialSlide={index}
    >
      {images.map((item, idx) => (
        <SwiperSlide
          key={`${item.id ?? idx}-${idx}`}
          className="flex h-full w-full items-center justify-center"
        >
          <img
            src={item?.url || item?.previewUrl || undefined}
            alt={item?.description || "media"}
            className="max-h-[85vh] w-full object-contain"
          />
        </SwiperSlide>
      ))}
    </Swiper>
  )
}