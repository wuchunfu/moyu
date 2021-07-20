/**
 * @description        数据库和数据表定义
 * @author             shuxiaokai
 * @create             2021-7-13 22:50
 */
import Dexie from "dexie";
// import config from "@/../config/config";
import { ResApiProjectListInfo } from "@@/global"

class MoyuDataBase extends Dexie {
    public projectList: Dexie.Table<ResApiProjectListInfo, number>
    public constructor() {
        super("MoyuDataBase");
        this.version(1).stores({
            projectList: "list, recentVisitProjects, starProjects"
        });
        this.projectList = this.table("projectList");
    }
}

const db = new MoyuDataBase();

export default db;