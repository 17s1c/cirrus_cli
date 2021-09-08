import { generateFileFromTpl } from '../utils'
import * as fs from 'fs'
jest.mock('fs')

describe('generateFileFromTpl', () => {
    it('should generate file from tpl', () => {
        const spyExistsSync = jest
            .spyOn(fs, 'writeFileSync')
            .mockImplementation(jest.fn())
        generateFileFromTpl(
            'Name = {{ projectName }}',
            { projectName: 'demo' },
            'http://test.com',
        )
        expect(spyExistsSync).toBeCalledWith('http://test.com', 'Name = demo')
    })
})
