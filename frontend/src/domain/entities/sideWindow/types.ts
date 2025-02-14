import type { SideWindowMenuKey } from './constants'

export namespace SideWindow {
  export type Path = {
    id?: number | undefined
    menu: SideWindowMenuKey
    subMenu?: string | undefined
  }
}
