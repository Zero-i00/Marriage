import type {ComponentProps} from "react";
import {twMerge} from "tailwind-merge";
import {Typography} from "@/shared/components/ui/typography";
import Image from "next/image";
import Link from "next/link";
import {ROOT_SECTION} from "@/shared/configs/section.config";
import {TG_ARTEM_LINK, TG_VARVARA_LINK} from "@/shared/constants/seo.constant";
import {ICON_SIZE} from "@/app/styles/types/size.type";


export function Footer({id = ROOT_SECTION.FOOTER, className, ...rest}: ComponentProps<'footer'>) {
  return (
      <footer id={id} className={twMerge(`container-section flex flex-col justify-center items-center gap-4`, className)} {...rest}>
        <div className={`flex flex-row justify-center items-center gap-4`}>
          <Link href={TG_ARTEM_LINK} target={'_blank'} rel="noopener noreferrer" aria-label="Telegram Артём">
            <Image
                width={ICON_SIZE.xl}
                height={ICON_SIZE.xl}
                alt={'Telegram Артёма'}
                src={'/footer/tg-icon-dark.svg'}
            />
          </Link>
          <Link href={TG_VARVARA_LINK} target={'_blank'} rel="noopener noreferrer" aria-label="Telegram Варвара">
            <Image
                width={ICON_SIZE.xl}
                height={ICON_SIZE.xl}
                alt={'Telegram Варвары'}
                src={'/footer/tg-icon-light.svg'}
            />
          </Link>
        </div>
        <Typography variant={'overline'}>
          © Артем & Варвара
        </Typography>
      </footer>
  )
}