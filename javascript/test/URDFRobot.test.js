import { JSDOM } from 'jsdom';
import URDFLoader from '../src/URDFLoader.js';

const jsdom = new JSDOM();
const window = jsdom.window;
global.DOMParser = window.DOMParser;
global.XMLSerializer = window.XMLSerializer;

describe('URDFRobot', () => {
    it('should correctly set all joint angles when using setJointValues.', () => {
        const loader = new URDFLoader();
        const robot = loader.parse(`
            <robot name="TEST">
                <link name="LINK1"/>
                <link name="LINK2"/>
                <link name="LINK3"/>
                <joint name="JOINT1" type="continuous">
                    <axis xyz="0 0 -1" />
                    <parent link="LINK1"/>
                    <child link="LINK2"/>
                </joint>
                <joint name="JOINT2" type="continuous">
                    <axis xyz="0 0 -1" />
                    <parent link="LINK2"/>
                    <child link="LINK3"/>
                </joint>
            </robot>
        `);

        expect(robot.setJointValues({ JOINT1: 1, JOINT2: 2 })).toBeTruthy();
        expect(robot.joints.JOINT1.angle).toEqual(1);
        expect(robot.joints.JOINT2.angle).toEqual(2);
    });

    it('should parse material colors and name.', () => {
        const loader = new URDFLoader();
        const res = loader.parse(`
            <robot name="TEST">
                <link name="LINK1"/>
                <link name="LINK2"/>
                <joint name="JOINT">
                    <parent link="LINK1"/>
                    <child link="LINK2"/>
                </joint>
            </robot>
        `);

        const names = [];
        res.traverse(c => names.push(c.name));

        expect(names).toEqual(['LINK1', 'JOINT', 'LINK2']);

        expect(Object.keys(res.links)).toEqual(['LINK1', 'LINK2']);
        expect(Object.keys(res.joints)).toEqual(['JOINT']);
        expect(Object.keys(res.frames)).toEqual(['LINK1', 'LINK2', 'JOINT']);
    });

    it('should clone the links and joints dictionaries correctly.', () => {
        const loader = new URDFLoader();
        const res = loader.parse(`
            <robot name="TEST">
                <link name="LINK1"/>
                <link name="LINK2"/>
                <joint name="JOINT">
                    <parent link="LINK1"/>
                    <child link="LINK2"/>
                </joint>
            </robot>
        `).clone();

        const names = [];
        res.traverse(c => names.push(c.name));

        expect(names).toEqual(['LINK1', 'JOINT', 'LINK2']);

        expect(Object.keys(res.links)).toEqual(['LINK1', 'LINK2']);
        expect(Object.keys(res.joints)).toEqual(['JOINT']);
        expect(Object.keys(res.frames)).toEqual(['LINK1', 'LINK2', 'JOINT']);
    });

    it('should include visual and collision names in the name map.', () => {
        const loader = new URDFLoader();
        loader.parseCollision = true;
        const res = loader.parse(`
            <robot name="TEST">
                <link name="LINK1">
                    <visual name="BOX1_VISUAL">
                        <box size="1 1 1"/>
                    </visual>
                    <collision name="BOX1_COLLISION">
                        <box size="1 1 1"/>
                    </collision>
                </link>
                <link name="LINK2">
                    <visual name="BOX2_VISUAL">
                        <box size="1 1 1"/>
                    </visual>
                    <collision name="BOX2_COLLISION">
                        <box size="1 1 1"/>
                    </collision>
                </link>
                <joint name="JOINT">
                    <parent link="LINK1"/>
                    <child link="LINK2"/>
                </joint>
            </robot>
        `).clone();

        expect(Object.keys(res.links)).toEqual(['LINK1', 'LINK2']);
        expect(Object.keys(res.joints)).toEqual(['JOINT']);
        expect(Object.keys(res.visual)).toEqual(['BOX1_VISUAL', 'BOX2_VISUAL']);
        expect(Object.keys(res.colliders)).toEqual(['BOX1_COLLISION', 'BOX2_COLLISION']);
        expect(Object.keys(res.frames)).toEqual([
            'BOX1_COLLISION', 'BOX2_COLLISION',
            'BOX1_VISUAL', 'BOX2_VISUAL',
            'LINK1', 'LINK2', 'JOINT',
        ]);
    });
});
