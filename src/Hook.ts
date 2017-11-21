import * as Bluebird from 'bluebird';

export interface HookInterface {
  onLoad: {
    (): (Bluebird<void | Error> | void)
  }

  onLift: {
    (): (Bluebird<void | Error> | void)
  }

  onLower: {
    (): (Bluebird<void | Error> | void)
  }
}

export class Hook implements HookInterface {
  onLoad() {
    // Does nothing on purpose
  }

  onLift() {
    // Does nothing on purpose
  }

  onLower() {
    // Does nothing on purpose
  }
}
