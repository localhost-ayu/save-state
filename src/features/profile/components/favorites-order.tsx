"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useTransition } from "react";
import { reorderFavorites } from "@/features/library/actions";
import { GameCover } from "@/features/library/components/game-cover";
import { cn } from "@/lib/cn";
import type { MyProfileSettings } from "../queries";

type Favorite = MyProfileSettings["favorites"][number];

function Item({ favorite, position }: { favorite: Favorite; position: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: favorite.id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("flex w-24 shrink-0 touch-none flex-col gap-1.5", isDragging && "relative z-10 opacity-80")}
      aria-label={`${favorite.game.title}, posição ${position}`}
      {...attributes}
      {...listeners}
    >
      <div className="relative cursor-grab active:cursor-grabbing">
        <GameCover
          title={favorite.game.title}
          coverUrl={favorite.game.cover_url}
          customCoverPath={favorite.custom_cover_path}
          sizes="96px"
          className="w-full rounded-[calc(var(--card-radius)*0.6)]"
        />
        <span className="absolute top-1.5 left-1.5 rounded-[4px] bg-black/60 px-1.5 py-0.5 font-label text-[10px] text-white">
          #{position}
        </span>
      </div>
      <span className="truncate text-xs font-medium">{favorite.game.title}</span>
    </li>
  );
}

export function FavoritesOrder({ favorites }: { favorites: Favorite[] }) {
  const [items, setItems] = useState(favorites);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const titleOf = (id: string | number) => items.find((item) => item.id === id)?.game.title ?? "Jogo";
  const positionOf = (id: string | number) => items.findIndex((item) => item.id === id) + 1;
  const announcements: Announcements = {
    onDragStart: ({ active }) => `${titleOf(active.id)} selecionado, posição ${positionOf(active.id)}.`,
    onDragOver: ({ active, over }) => (over ? `${titleOf(active.id)} na posição ${positionOf(over.id)}.` : undefined),
    onDragEnd: ({ active, over }) =>
      over ? `${titleOf(active.id)} solto na posição ${positionOf(over.id)}.` : "Movimento cancelado.",
    onDragCancel: () => "Movimento cancelado.",
  };

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const next = arrayMove(
      items,
      items.findIndex((item) => item.id === active.id),
      items.findIndex((item) => item.id === over.id),
    );
    setItems(next);
    startTransition(async () => {
      const result = await reorderFavorites(next.map((item) => item.id));
      setMessage(result.ok ? "Ordem salva." : result.error);
    });
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted">
        Nenhum favorito ainda. Marque &quot;Favoritar&quot; na página de um jogo para ele aparecer aqui.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted">
        Arraste para o lado para mudar a ordem. Pelo teclado: Espaço pega, setas movem, Espaço solta.
      </p>
      <DndContext
        id="favorites-order"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
        accessibility={{ announcements }}
      >
        <SortableContext items={items.map((item) => item.id)} strategy={horizontalListSortingStrategy}>
          <ol className="flex gap-3 overflow-x-auto pb-2">
            {items.map((favorite, index) => (
              <Item key={favorite.id} favorite={favorite} position={index + 1} />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
      <span role="status" className="min-h-5 text-xs text-muted">
        {pending ? "Salvando…" : message}
      </span>
    </div>
  );
}
