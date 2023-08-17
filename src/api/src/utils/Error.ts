import {APIError} from "./errors";

export function success<T, E>(value: T): Result<T, E> {
  return new Ok(value);
}

export function isOk<T, E>(result: Result<T, E>): result is Ok<T, E> {
  return result.tag === 'OK';
}

export function failure<T, E>(error: E): Result<T, E> {
  return new Err(error);
}

export function isErr<T, E>(result: Result<T, E>): result is Err<T, E> {
  return result.tag === 'ERR'
}

export type APIResult<T> = Result<T, APIError>;

interface IResult<T, E> {
  isOk(): boolean;
  isErr(): boolean;
  andThen<O>(f: (value: T) => Result<O, E>): Result<O, E>;
  map<O>(f: (value: T) => O): Result<O, E>;
  mapErr<O>(f: (error: E) => O): Result<T, O>;
  orElse<O>(f: (error: E) => Result<T, O>): Result<T, O>;
  unwrapOr<O>(defaultValue: O): T | O;
}

export type Result<T, E> = Ok<T, E> | Err<T, E>;

class Ok<T, E> implements IResult<T, E> {
  public readonly tag: 'OK';

  constructor(public readonly value: T) {
    this.tag = 'OK';
  }

  isOk = (): this is Ok<T, E> => true;
  isErr = (): this is Err<T, E> => false;

  andThen<O>(f: (value: T) => Result<O, E>): Result<O, E> {
    return f(this.value);
  }

  map<O>(f: (value: T) => O): Result<O, E> {
    return success(f(this.value));
  }

  mapErr<O>(unused: (error: E) => O): Result<T, O> {
    return success(this.value);
  }

  orElse<O>(unused: (error: E) => Result<T, O>): Result<T, O> {
    return success(this.value);
  }

  unwrapOr<O>(unused: O): T | O {
    return this.value;
  }
}

class Err<T, E> implements IResult<T, E> {
  public readonly tag: 'ERR'

  constructor(public readonly error: E) {
    this.tag = 'ERR';
  }

  isOk = (): this is Ok<T, E> => false;
  isErr = (): this is Err<T, E> => true;

  andThen<O>(unused: (value: T) => Result<O, E>): Result<O, E> {
    return failure(this.error);
  }

  map<O>(unused: (value: T) => O): Result<O, E> {
    return failure(this.error);
  }

  mapErr<O>(f: (error: E) => O): Result<T, O> {
    return failure(f(this.error));
  }

  orElse<O>(f: (error: E) => Result<T, O>): Result<T, O> {
    return f(this.error);
  }

  unwrapOr<O>(defaultValue: O): T | O {
    return defaultValue;
  }
}