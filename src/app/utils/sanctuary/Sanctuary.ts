export interface Maybe<A> {
    isNothing:boolean;
    isJust:boolean;
    value:A;
}

export interface Either<A> {
    isLeft:boolean;
    isRight:boolean;
    value:A;
}

import {create, env} from 'sanctuary';

const checkTypes = false; //process.env.BUILD_TYPE !== 'build';

export const S = create({checkTypes, env});
