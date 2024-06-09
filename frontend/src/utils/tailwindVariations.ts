import { TVariations } from "./types"

export const primaryDefault = 'bg-slate-900 active:bg-slate-900 text-white'
export const secondaryDefault = 'bg-slate-700 active:bg-slate-700 text-white'

const inputDefault = `  
    p-2 m-2 rounded-lg
    disabled:opacity-75
    disabled:text-gray-200
    disabled:cursor-not-allowed
`

export const inputVariations : TVariations = {
    varone : `bg-red-800 active:bg-red-700 ${inputDefault}`,
    vartwo : `bg-pink-800 active:bg-pink-700${inputDefault}`,
    varthree : `bg-blue-800 active:bg-blue-700${inputDefault}`,
    varfour : `bg-green-800 active:bg-blue-700${inputDefault}`,
}

export const selectVariations = {
    varone : `bg-red-800 ${inputDefault}`,
    vartwo : `bg-pink-800 ${inputDefault}`,
    varthree : `bg-blue-800 ${inputDefault}`,
}

export const titleVariations = {
    varone : 'text-xl font-bold text-red-500',
    vartwo : 'text-lg font-bold text-yellow-500',
    varthree : 'text font text-green-500',
  }