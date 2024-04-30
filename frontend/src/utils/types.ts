export type TUser = Partial <{
    name : string,
    username : string,
    email : string,
    password : string,
    role : string
}>

export type TElementProps = Partial<{
    value : string,
    variationName : 'varone' | 'vartwo' | 'varthree'
}>

export type TVariations = {
    [index: string]: string;
  }

export type TFieldKeys = keyof TUser

export type TResponse = {
    success : boolean,
    message : string,
    body ? : object,
}