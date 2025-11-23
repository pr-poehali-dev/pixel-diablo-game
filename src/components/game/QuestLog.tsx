import { Quest } from '@/types/game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface QuestLogProps {
  quests: Quest[];
}

export default function QuestLog({ quests }: QuestLogProps) {
  const activeQuests = quests.filter(q => q.isActive && !q.isCompleted);
  const completedQuests = quests.filter(q => q.isCompleted);

  return (
    <Card className="bg-card/95 border-2 border-primary/50 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl pixel-font text-primary flex items-center gap-2">
          📜 Квесты
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeQuests.length === 0 && completedQuests.length === 0 ? (
          <div className="text-center text-muted-foreground pixel-text py-8">
            Нет доступных квестов
          </div>
        ) : (
          <>
            {activeQuests.length > 0 && (
              <div className="space-y-3">
                <div className="text-sm pixel-font text-primary">Активные квесты</div>
                {activeQuests.map((quest) => (
                  <Card key={quest.id} className="bg-muted/30 border-2 border-primary/30">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="pixel-font text-sm text-primary">
                            {quest.title}
                          </div>
                          <div className="text-xs pixel-text text-muted-foreground">
                            {quest.description}
                          </div>
                        </div>
                        <Badge className="pixel-text text-xs">
                          {quest.type === 'kill' ? '⚔️' : quest.type === 'collect' ? '📦' : '🗺️'}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        {quest.objectives.map((obj, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-xs pixel-text">
                              <span className="text-foreground">{obj.description}</span>
                              <span className={obj.completed ? 'text-green-500' : 'text-muted-foreground'}>
                                {obj.current} / {obj.target}
                              </span>
                            </div>
                            <Progress 
                              value={(obj.current / obj.target) * 100} 
                              className="h-2 bg-muted"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-border">
                        <div className="text-xs pixel-text text-muted-foreground">Награды:</div>
                        <div className="flex gap-3 text-xs pixel-text mt-1">
                          <span className="text-primary">⭐ {quest.rewards.experience} опыта</span>
                          <span className="text-yellow-500">💰 {quest.rewards.gold} золота</span>
                          {quest.rewards.items && quest.rewards.items.length > 0 && (
                            <span className="text-purple-400">
                              🎁 {quest.rewards.items.length} предмет(ов)
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {completedQuests.length > 0 && (
              <div className="space-y-3">
                <div className="text-sm pixel-font text-green-500">Завершенные квесты</div>
                {completedQuests.map((quest) => (
                  <Card key={quest.id} className="bg-green-950/20 border-2 border-green-500/30 opacity-75">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <div className="pixel-font text-sm text-green-500">
                          {quest.title}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
