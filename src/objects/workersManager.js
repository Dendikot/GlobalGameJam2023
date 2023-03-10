import * as Phaser from 'phaser';
import {customConfig, baseGameValues} from "./config";
import { ExtPoint } from './ext-point';

export class Worker {
    sprite;
    point;
    constructor(sprite) {
        this.sprite = sprite;
        this.point = this.Point(this.sprite.x, this.sprite.y);
    }

    Point(x, y) {
        return ExtPoint.createWithCoordinates(x, y);
     }

     flipToCommie(){
        this.sprite.setTexture('workerUnited');
     }
}


export class workersManager {
    currentWorkers = [];
    scene;

    constructor(scene) {
        this.scene = scene;
    }

    spawnWorkers(levelIndex = 0){
        for (let index = 0; index < customConfig.workersAmount; index++) {
            this.currentWorkers.push(this.createWorker(this.randomPos()));
        }
    }

    createWorker(position){
        const workerSprite = this.scene.add.sprite(position.x, position.y, 'worker');
        const target = new Worker(workerSprite);
        return target;
    }

    randomPos(){
        return new Phaser.Math.Vector2(Phaser.Math.Between(customConfig.margin * 2, baseGameValues.gameWidth - customConfig.margin * 2),Phaser.Math.Between(0, customConfig.frameHeight));
    }


    getWorkers(){
        return this.currentWorkers;
    }
}