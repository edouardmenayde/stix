export interface HookInterface {
  onLoad: {
    (): (Promise<void | Error> | void)
  }

  onLift: {
    (): (Promise<void | Error> | void)
  }

  onLower: {
    (): (Promise<void | Error> | void)
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
