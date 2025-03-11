trigger ContactTrigger on Contact (after insert, after update , after undelete , after delete) {
    if(Trigger.isDelete){
        UtilityMapPlatformEventsController.publishUtilityUpdate(Trigger.old,'Contact','Delete');
    }else{
        UtilityMapPlatformEventsController.publishUtilityUpdate(Trigger.new,'Contact','Others');
    }
}